-- ===========================================
-- CVE-to-BIP Correlation: link CVEs to vulnerabilities and external signals
-- ===========================================

-- 1. Add cve_id to vulnerabilities for CVE-originated records
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cve_id TEXT;

-- Unique partial index: one vulnerability per CVE
CREATE UNIQUE INDEX IF NOT EXISTS idx_vulnerabilities_cve_id
  ON vulnerabilities (cve_id) WHERE cve_id IS NOT NULL;

-- 2. Add vulnerability_id to external_signals for back-reference
ALTER TABLE external_signals ADD COLUMN IF NOT EXISTS vulnerability_id TEXT;

CREATE INDEX IF NOT EXISTS idx_external_signals_vulnerability
  ON external_signals (vulnerability_id) WHERE vulnerability_id IS NOT NULL;
