-- ===========================================
-- Bitcoin RMF - Supabase Schema
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Users
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  fair_tef NUMERIC,
  fair_vulnerability NUMERIC CHECK (fair_vulnerability BETWEEN 0 AND 1),
  fair_lef NUMERIC,
  fair_primary_loss_usd NUMERIC,
  fair_secondary_loss_usd NUMERIC,
  fair_ale NUMERIC,
  nist_stage TEXT DEFAULT 'PREPARE' CHECK (nist_stage IN (
    'PREPARE', 'CATEGORIZE', 'SELECT', 'IMPLEMENT', 'ASSESS', 'AUTHORIZE', 'MONITOR'
  )),
  status TEXT DEFAULT 'IDENTIFIED' CHECK (status IN (
    'IDENTIFIED', 'ANALYZING', 'MITIGATED', 'ACCEPTED', 'MONITORING', 'ESCALATED'
  )),
  related_bips TEXT[] DEFAULT '{}',
  evidence_sources JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  date_identified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Remediation Strategies
-- ===========================================
CREATE TABLE IF NOT EXISTS remediation_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_id UUID NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  effectiveness INTEGER CHECK (effectiveness BETWEEN 0 AND 100),
  estimated_cost_usd NUMERIC,
  timeline_months INTEGER,
  status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED')),
  related_bips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- BIP Evaluations
-- ===========================================
CREATE TABLE IF NOT EXISTS bip_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bip_number TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  recommendation TEXT CHECK (recommendation IN ('ESSENTIAL', 'RECOMMENDED', 'OPTIONAL', 'UNNECESSARY', 'HARMFUL')),
  necessity_score INTEGER CHECK (necessity_score BETWEEN 0 AND 100),
  threats_addressed UUID[] DEFAULT '{}',
  mitigation_effectiveness INTEGER CHECK (mitigation_effectiveness BETWEEN 0 AND 100),
  community_consensus INTEGER CHECK (community_consensus BETWEEN 0 AND 100),
  implementation_readiness INTEGER CHECK (implementation_readiness BETWEEN 0 AND 100),
  economic_impact TEXT,
  adoption_percentage INTEGER CHECK (adoption_percentage BETWEEN 0 AND 100),
  status TEXT DEFAULT 'PROPOSED' CHECK (status IN ('DRAFT', 'PROPOSED', 'ACTIVE', 'FINAL', 'WITHDRAWN', 'REPLACED')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FUD Analyses
-- ===========================================
CREATE TABLE IF NOT EXISTS fud_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  narrative TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'QUANTUM', 'REGULATION', 'CENTRALIZATION', 'ENERGY', 'SCALABILITY', 'COMPETITION', 'SECURITY'
  )),
  validity_score INTEGER CHECK (validity_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEBUNKED', 'PARTIALLY_VALID')),
  evidence_for TEXT[] DEFAULT '{}',
  evidence_against TEXT[] DEFAULT '{}',
  debunk_summary TEXT,
  related_threats UUID[] DEFAULT '{}',
  price_impact_estimate TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Indexes
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_threats_stride ON threats(stride_category);
CREATE INDEX IF NOT EXISTS idx_threats_source ON threats(threat_source);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_remediation_threat ON remediation_strategies(threat_id);
CREATE INDEX IF NOT EXISTS idx_bip_number ON bip_evaluations(bip_number);
CREATE INDEX IF NOT EXISTS idx_fud_category ON fud_analyses(category);
CREATE INDEX IF NOT EXISTS idx_fud_status ON fud_analyses(status);

-- ===========================================
-- Row Level Security
-- ===========================================
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bip_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fud_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read threats" ON threats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read remediations" ON remediation_strategies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read BIPs" ON bip_evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read FUD" ON fud_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Write access for authenticated users
CREATE POLICY "Authenticated users can insert threats" ON threats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update threats" ON threats
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert remediations" ON remediation_strategies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update remediations" ON remediation_strategies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert BIPs" ON bip_evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update BIPs" ON bip_evaluations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert FUD" ON fud_analyses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update FUD" ON fud_analyses
  FOR UPDATE USING (auth.role() = 'authenticated');

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

CREATE TRIGGER remediation_strategies_updated_at BEFORE UPDATE ON remediation_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bip_evaluations_updated_at BEFORE UPDATE ON bip_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fud_analyses_updated_at BEFORE UPDATE ON fud_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
