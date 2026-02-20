-- Risk Snapshots: daily dashboard stats for trend tracking
CREATE TABLE IF NOT EXISTS risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  stats JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_risk_snapshots_date ON risk_snapshots(snapshot_date DESC);

-- X Posts: tracking automated posts to @BitcoinRMF
CREATE TABLE IF NOT EXISTS x_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT,
  content TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_x_posts_status ON x_posts(status);
CREATE INDEX idx_x_posts_trigger ON x_posts(trigger_type, created_at DESC);
