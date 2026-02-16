-- ===========================================
-- Add Vulnerabilities + Threat-Vulnerability junction
-- ===========================================

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_components TEXT[] DEFAULT '{}',
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  exploitability INTEGER NOT NULL CHECK (exploitability BETWEEN 1 AND 5),
  vulnerability_score INTEGER GENERATED ALWAYS AS (severity * exploitability) STORED,
  vulnerability_rating TEXT GENERATED ALWAYS AS (
    CASE
      WHEN severity * exploitability >= 20 THEN 'CRITICAL'
      WHEN severity * exploitability >= 12 THEN 'HIGH'
      WHEN severity * exploitability >= 6 THEN 'MEDIUM'
      WHEN severity * exploitability >= 3 THEN 'LOW'
      ELSE 'VERY_LOW'
    END
  ) STORED,
  vuln_status TEXT DEFAULT 'DISCOVERED' CHECK (vuln_status IN (
    'DISCOVERED', 'CONFIRMED', 'EXPLOITABLE', 'PATCHED', 'MITIGATED'
  )),
  remediation_strategies JSONB DEFAULT '[]',
  related_bips TEXT[] DEFAULT '{}',
  evidence_sources JSONB DEFAULT '[]',
  status TEXT DEFAULT 'published' CHECK (status IN (
    'draft', 'published', 'archived', 'under_review'
  )),
  submitted_by TEXT,
  submitted_by_name TEXT,
  date_identified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for threat-vulnerability relationships
CREATE TABLE IF NOT EXISTS threat_vulnerabilities (
  threat_id TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
  vulnerability_id TEXT NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (threat_id, vulnerability_id)
);

-- Add vulnerability_ids array to threats for denormalized access
ALTER TABLE threats ADD COLUMN IF NOT EXISTS vulnerability_ids TEXT[] DEFAULT '{}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(vulnerability_score DESC);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_vuln_status ON vulnerabilities(vuln_status);
CREATE INDEX IF NOT EXISTS idx_threat_vulns_threat ON threat_vulnerabilities(threat_id);
CREATE INDEX IF NOT EXISTS idx_threat_vulns_vuln ON threat_vulnerabilities(vulnerability_id);

-- RLS
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_vulnerabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published vulnerabilities" ON vulnerabilities
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read threat_vulnerabilities" ON threat_vulnerabilities
  FOR SELECT USING (true);

-- Updated at trigger
CREATE TRIGGER vulnerabilities_updated_at BEFORE UPDATE ON vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update audit_log constraint to include 'vulnerability'
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_entity_type_check
  CHECK (entity_type IN ('threat', 'bip', 'fud', 'vulnerability'));

-- Update comments constraint to include 'vulnerability'
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_target_type_check;
ALTER TABLE comments ADD CONSTRAINT comments_target_type_check
  CHECK (target_type IN ('threat', 'bip', 'fud', 'vulnerability'));

-- Update votes constraint to include 'vulnerability'
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_target_type_check;
ALTER TABLE votes ADD CONSTRAINT votes_target_type_check
  CHECK (target_type IN ('threat', 'fud', 'vulnerability'));
