-- ===========================================
-- Bitcoin RMF - Supabase Schema (v2)
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Users (unchanged)
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'analyst', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Threats
-- ===========================================
CREATE TABLE IF NOT EXISTS threats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stride_category TEXT NOT NULL CHECK (stride_category IN (
    'SPOOFING', 'TAMPERING', 'REPUDIATION',
    'INFORMATION_DISCLOSURE', 'DENIAL_OF_SERVICE', 'ELEVATION_OF_PRIVILEGE'
  )),
  stride_rationale TEXT,
  threat_source TEXT NOT NULL CHECK (threat_source IN (
    'SOCIAL_MEDIA', 'TECHNOLOGY', 'REGULATORY', 'NETWORK',
    'PROTOCOL', 'CRYPTOGRAPHIC', 'OPERATIONAL', 'SUPPLY_CHAIN'
  )),
  affected_components TEXT[] DEFAULT '{}',
  vulnerability TEXT,
  exploit_scenario TEXT,
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  likelihood_justification TEXT,
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  impact_justification TEXT,
  severity_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  risk_rating TEXT GENERATED ALWAYS AS (
    CASE
      WHEN likelihood * impact >= 20 THEN 'CRITICAL'
      WHEN likelihood * impact >= 12 THEN 'HIGH'
      WHEN likelihood * impact >= 6 THEN 'MEDIUM'
      WHEN likelihood * impact >= 3 THEN 'LOW'
      ELSE 'VERY_LOW'
    END
  ) STORED,
  -- FAIR fields with citation columns
  fair_tef NUMERIC,
  fair_tef_citation TEXT,
  fair_vulnerability NUMERIC CHECK (fair_vulnerability BETWEEN 0 AND 1),
  fair_vulnerability_citation TEXT,
  fair_lef NUMERIC,
  fair_primary_loss_usd NUMERIC,
  fair_primary_loss_citation TEXT,
  fair_secondary_loss_usd NUMERIC,
  fair_secondary_loss_citation TEXT,
  fair_ale NUMERIC,
  -- Remediation as JSONB (no separate table)
  remediation_strategies JSONB DEFAULT '[]',
  -- Workflow
  nist_stage TEXT DEFAULT 'PREPARE' CHECK (nist_stage IN (
    'PREPARE', 'CATEGORIZE', 'SELECT', 'IMPLEMENT', 'ASSESS', 'AUTHORIZE', 'MONITOR'
  )),
  rmf_status TEXT DEFAULT 'IDENTIFIED' CHECK (rmf_status IN (
    'IDENTIFIED', 'ANALYZING', 'MITIGATED', 'ACCEPTED', 'MONITORING', 'ESCALATED'
  )),
  status TEXT DEFAULT 'published' CHECK (status IN (
    'draft', 'published', 'archived', 'under_review'
  )),
  related_bips TEXT[] DEFAULT '{}',
  evidence_sources JSONB DEFAULT '[]',
  submitted_by TEXT,
  submitted_by_name TEXT,
  date_identified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- BIP Evaluations
-- ===========================================
CREATE TABLE IF NOT EXISTS bip_evaluations (
  id TEXT PRIMARY KEY,
  bip_number TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  recommendation TEXT CHECK (recommendation IN ('ESSENTIAL', 'RECOMMENDED', 'OPTIONAL', 'UNNECESSARY', 'HARMFUL')),
  necessity_score INTEGER CHECK (necessity_score BETWEEN 0 AND 100),
  threats_addressed TEXT[] DEFAULT '{}',
  mitigation_effectiveness INTEGER CHECK (mitigation_effectiveness BETWEEN 0 AND 100),
  community_consensus INTEGER CHECK (community_consensus BETWEEN 0 AND 100),
  implementation_readiness INTEGER CHECK (implementation_readiness BETWEEN 0 AND 100),
  economic_impact TEXT,
  adoption_percentage INTEGER CHECK (adoption_percentage BETWEEN 0 AND 100),
  bip_status TEXT DEFAULT 'PROPOSED' CHECK (bip_status IN ('DRAFT', 'PROPOSED', 'ACTIVE', 'FINAL', 'WITHDRAWN', 'REPLACED')),
  status TEXT DEFAULT 'published' CHECK (status IN (
    'draft', 'published', 'archived', 'under_review'
  )),
  submitted_by TEXT,
  submitted_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FUD Analyses
-- ===========================================
CREATE TABLE IF NOT EXISTS fud_analyses (
  id TEXT PRIMARY KEY,
  narrative TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'QUANTUM', 'REGULATION', 'CENTRALIZATION', 'ENERGY', 'SCALABILITY', 'COMPETITION', 'SECURITY'
  )),
  validity_score INTEGER CHECK (validity_score BETWEEN 0 AND 100),
  fud_status TEXT DEFAULT 'ACTIVE' CHECK (fud_status IN ('ACTIVE', 'DEBUNKED', 'PARTIALLY_VALID')),
  status TEXT DEFAULT 'published' CHECK (status IN (
    'draft', 'published', 'archived', 'under_review'
  )),
  evidence_for TEXT[] DEFAULT '{}',
  evidence_against TEXT[] DEFAULT '{}',
  debunk_summary TEXT,
  related_threats TEXT[] DEFAULT '{}',
  price_impact_estimate TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  submitted_by TEXT,
  submitted_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Audit Log
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('threat', 'bip', 'fud')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'archive', 'reject')),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Comments (unchanged)
-- ===========================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('threat', 'bip', 'fud')),
  target_id TEXT NOT NULL,
  x_id TEXT NOT NULL,
  x_username TEXT NOT NULL,
  x_name TEXT NOT NULL,
  x_profile_image TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Indexes
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_threats_stride ON threats(stride_category);
CREATE INDEX IF NOT EXISTS idx_threats_source ON threats(threat_source);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_rmf_status ON threats(rmf_status);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_bip_number ON bip_evaluations(bip_number);
CREATE INDEX IF NOT EXISTS idx_bip_status ON bip_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_fud_category ON fud_analyses(category);
CREATE INDEX IF NOT EXISTS idx_fud_status ON fud_analyses(status);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_x_id ON comments(x_id);

-- ===========================================
-- Row Level Security
-- ===========================================
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bip_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fud_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public read published threats" ON threats
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read published BIPs" ON bip_evaluations
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read published FUD" ON fud_analyses
  FOR SELECT USING (status = 'published');

-- Service role has full access (used by API routes via createAdminClient)
-- No explicit policy needed; service_role bypasses RLS

-- Comments: anyone can read
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (x_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Audit log: read only for authenticated
CREATE POLICY "Authenticated read audit log" ON audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can read their own data
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- ===========================================
-- Updated at trigger
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER threats_updated_at BEFORE UPDATE ON threats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bip_evaluations_updated_at BEFORE UPDATE ON bip_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fud_analyses_updated_at BEFORE UPDATE ON fud_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
