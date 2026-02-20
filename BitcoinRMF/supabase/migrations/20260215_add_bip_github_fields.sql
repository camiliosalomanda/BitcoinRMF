-- Add GitHub-sourced metadata columns to bip_evaluations
ALTER TABLE bip_evaluations ADD COLUMN IF NOT EXISTS bip_author TEXT;
ALTER TABLE bip_evaluations ADD COLUMN IF NOT EXISTS bip_type TEXT;
ALTER TABLE bip_evaluations ADD COLUMN IF NOT EXISTS bip_layer TEXT;
