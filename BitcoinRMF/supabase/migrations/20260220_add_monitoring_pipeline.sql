-- ===========================================
-- Monitoring Pipeline — Re-evaluation queue, external signals, pipeline health
-- ===========================================

-- 1. Re-evaluation queue: BIPs needing re-evaluation
CREATE TABLE IF NOT EXISTS reeval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bip_id TEXT NOT NULL,
  bip_number TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'status_change', 'new_threat', 'new_vulnerability', 'scheduled', 'webhook', 'manual'
  )),
  details TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Prevent duplicate pending entries for the same BIP
CREATE UNIQUE INDEX IF NOT EXISTS idx_reeval_queue_pending
  ON reeval_queue (bip_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_reeval_queue_status ON reeval_queue(status);
CREATE INDEX IF NOT EXISTS idx_reeval_queue_priority ON reeval_queue(priority DESC, created_at ASC);

-- 2. External signals: staging table for threat/vuln/fud signals from external sources
CREATE TABLE IF NOT EXISTS external_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'unknown')),
  published_date TIMESTAMPTZ,
  related_bips TEXT[] DEFAULT '{}',
  cve_id TEXT,
  processed BOOLEAN DEFAULT FALSE,
  threat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deduplication: one signal per source+external_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_signals_dedup
  ON external_signals (source, external_id);

CREATE INDEX IF NOT EXISTS idx_external_signals_processed ON external_signals(processed);
CREATE INDEX IF NOT EXISTS idx_external_signals_source ON external_signals(source);
CREATE INDEX IF NOT EXISTS idx_external_signals_created ON external_signals(created_at DESC);

-- 3. Monitoring runs: pipeline health tracking
CREATE TABLE IF NOT EXISTS monitoring_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline TEXT NOT NULL CHECK (pipeline IN ('bip_sync', 'threat_scan', 'fud_scan', 'reeval')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_monitoring_runs_pipeline ON monitoring_runs(pipeline, started_at DESC);

-- 4. Add monitoring columns to bip_evaluations
ALTER TABLE bip_evaluations ADD COLUMN IF NOT EXISTS last_evaluated_at TIMESTAMPTZ;
ALTER TABLE bip_evaluations ADD COLUMN IF NOT EXISTS evaluation_trigger TEXT;

-- 5. Update audit_log action constraint to include pipeline actions
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check
  CHECK (action IN (
    'create', 'update', 'delete', 'publish', 'archive', 'reject',
    'vote_publish', 'vote_archive',
    'auto_reeval', 'status_change', 'pipeline_signal'
  ));

-- 6. RLS policies for new tables
ALTER TABLE reeval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_runs ENABLE ROW LEVEL SECURITY;

-- Service role (used by crons/API) bypasses RLS.
-- Public can read monitoring runs for transparency.
CREATE POLICY "Public read monitoring runs" ON monitoring_runs
  FOR SELECT USING (true);

CREATE POLICY "Public read external signals" ON external_signals
  FOR SELECT USING (true);

CREATE POLICY "Public read reeval queue" ON reeval_queue
  FOR SELECT USING (true);

-- 7. DB trigger: when a threat is published, queue affected BIPs for re-evaluation
CREATE OR REPLACE FUNCTION queue_bips_on_threat_publish()
RETURNS TRIGGER AS $$
DECLARE
  bip_ref TEXT;
  bip_row RECORD;
BEGIN
  -- Only fire when status changes TO 'published'
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    FOREACH bip_ref IN ARRAY COALESCE(NEW.related_bips, '{}')
    LOOP
      -- Look up the BIP by bip_number
      FOR bip_row IN
        SELECT id, bip_number FROM bip_evaluations
        WHERE bip_number = bip_ref OR bip_number = REPLACE(bip_ref, 'BIP-', 'BIP-0')
      LOOP
        INSERT INTO reeval_queue (bip_id, bip_number, reason, details, priority)
        VALUES (bip_row.id, bip_row.bip_number, 'new_threat', 'Threat published: ' || NEW.name, 1)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER threat_publish_queue_bips
  AFTER INSERT OR UPDATE OF status ON threats
  FOR EACH ROW EXECUTE FUNCTION queue_bips_on_threat_publish();

-- 8. DB trigger: when a vulnerability is published, queue affected BIPs
CREATE OR REPLACE FUNCTION queue_bips_on_vuln_publish()
RETURNS TRIGGER AS $$
DECLARE
  bip_ref TEXT;
  bip_row RECORD;
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    FOREACH bip_ref IN ARRAY COALESCE(NEW.related_bips, '{}')
    LOOP
      FOR bip_row IN
        SELECT id, bip_number FROM bip_evaluations
        WHERE bip_number = bip_ref OR bip_number = REPLACE(bip_ref, 'BIP-', 'BIP-0')
      LOOP
        INSERT INTO reeval_queue (bip_id, bip_number, reason, details, priority)
        VALUES (bip_row.id, bip_row.bip_number, 'new_vulnerability', 'Vulnerability published: ' || NEW.name, 1)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vuln_publish_queue_bips
  AFTER INSERT OR UPDATE OF status ON vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION queue_bips_on_vuln_publish();
