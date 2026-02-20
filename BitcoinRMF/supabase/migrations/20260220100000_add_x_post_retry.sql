-- Add retry_count column to x_posts for failed post retry tracking
ALTER TABLE x_posts ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add index for retry queries (failed posts within time window)
CREATE INDEX IF NOT EXISTS idx_x_posts_failed_retry
  ON x_posts (status, created_at)
  WHERE status = 'failed';
