-- ============================================
-- BizAI Platform Database Schema
-- ============================================
-- 
-- This schema sets up the database for the BizAI platform.
-- 
-- To use this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this entire file and run it
-- 
-- Tables:
--   - companies: Company profiles and context
--   - conversations: Chat sessions with executives
--   - messages: Individual chat messages
--   - executive_messages: Inter-executive communications
--   - insights: AI-generated insights and recommendations
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Enums
-- ============================================

CREATE TYPE executive_role AS ENUM ('CFO', 'CMO', 'COO', 'CHRO', 'CTO', 'CCO');
CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE message_type AS ENUM ('info', 'request', 'approval', 'alert');
CREATE TYPE message_status AS ENUM ('pending', 'read', 'actioned');
CREATE TYPE company_size AS ENUM ('micro', 'small', 'medium');
CREATE TYPE business_stage AS ENUM ('pre_revenue', 'early', 'growth', 'mature');
CREATE TYPE business_model AS ENUM ('b2b', 'b2c', 'both');
CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');
CREATE TYPE insight_status AS ENUM ('active', 'dismissed', 'resolved');

-- ============================================
-- Users Table
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),  -- NULL for OAuth users
  avatar_url TEXT,
  auth_provider VARCHAR(50) DEFAULT 'credentials',
  email_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- Companies Table
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- References auth.users when using Supabase Auth
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  business_model business_model,
  location VARCHAR(255),
  size company_size,
  employee_count VARCHAR(50),
  annual_revenue VARCHAR(50),
  stage business_stage,
  currency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(100) DEFAULT 'UTC',
  fiscal_year_end VARCHAR(50) DEFAULT 'December',
  goals TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- ============================================
-- Conversations Table
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  executive executive_role NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_executive ON conversations(executive);

-- ============================================
-- Messages Table
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  content TEXT NOT NULL,
  executive executive_role,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- Executive Messages Table (Inter-executive communication)
-- ============================================

CREATE TABLE executive_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_executive executive_role NOT NULL,
  to_executive VARCHAR(10) NOT NULL, -- 'CFO', 'CMO', etc. or 'all'
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  priority message_priority DEFAULT 'normal',
  type message_type DEFAULT 'info',
  status message_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_executive_messages_company_id ON executive_messages(company_id);
CREATE INDEX idx_executive_messages_status ON executive_messages(status);
CREATE INDEX idx_executive_messages_created_at ON executive_messages(created_at);

-- ============================================
-- Insights Table
-- ============================================

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  executive executive_role NOT NULL,
  type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  impact impact_level DEFAULT 'medium',
  action_required BOOLEAN DEFAULT false,
  suggested_actions TEXT[] DEFAULT '{}',
  related_executives TEXT[] DEFAULT '{}',
  status insight_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_insights_company_id ON insights(company_id);
CREATE INDEX idx_insights_executive ON insights(executive);
CREATE INDEX idx_insights_status ON insights(status);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- These policies ensure users can only access their own data.
-- Enable these after setting up Supabase Auth.

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies (through conversation ownership)
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Executive messages policies (through company ownership)
CREATE POLICY "Users can view executive messages for their companies"
  ON executive_messages FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert executive messages for their companies"
  ON executive_messages FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update executive messages for their companies"
  ON executive_messages FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Insights policies (through company ownership)
CREATE POLICY "Users can view insights for their companies"
  ON insights FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for their companies"
  ON insights FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update insights for their companies"
  ON insights FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helpful Views
-- ============================================

-- View for conversation summaries
CREATE VIEW conversation_summaries AS
SELECT 
  c.id,
  c.company_id,
  c.user_id,
  c.executive,
  c.title,
  c.created_at,
  c.updated_at,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id;

-- View for company dashboard stats
CREATE VIEW company_stats AS
SELECT 
  co.id as company_id,
  co.user_id,
  co.name,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT em.id) FILTER (WHERE em.status = 'pending') as pending_executive_messages,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'active') as active_insights
FROM companies co
LEFT JOIN conversations c ON c.company_id = co.id
LEFT JOIN messages m ON m.conversation_id = c.id
LEFT JOIN executive_messages em ON em.company_id = co.id
LEFT JOIN insights i ON i.company_id = co.id
GROUP BY co.id;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment to insert sample data for testing

/*
-- Insert a sample company (replace user_id with a real user ID)
INSERT INTO companies (
  user_id,
  name,
  industry,
  business_model,
  size,
  employee_count,
  stage,
  goals,
  challenges
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with real user_id
  'Acme Corp',
  'Technology / Software',
  'b2b',
  'small',
  '11-25',
  'growth',
  ARRAY['Increase revenue', 'Hire key roles', 'Improve operations'],
  ARRAY['Cash flow management', 'Finding and hiring talent']
);
*/

-- ============================================
-- End of Schema
-- ============================================

-- ============================================
-- COMPLIANCE & SECURITY TABLES
-- ============================================

CREATE TYPE audit_action AS ENUM (
  'auth.login', 'auth.logout', 'auth.login_failed', 
  'auth.password_reset', 'auth.password_changed',
  'data.view', 'data.create', 'data.update', 'data.delete', 'data.export',
  'file.upload', 'file.download', 'file.delete',
  'ai.chat', 'ai.insight_generated',
  'security.rate_limit', 'security.unauthorized', 'security.suspicious_activity',
  'compliance.consent_given', 'compliance.consent_withdrawn',
  'compliance.data_deletion_requested', 'compliance.data_exported'
);

CREATE TYPE consent_type AS ENUM (
  'essential', 'analytics', 'marketing', 'ai_processing', 'third_party'
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action audit_action NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  data_category VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Consent Records Table
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  consent_type consent_type NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45) NOT NULL,
  policy_version VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);

-- Data Export Requests
CREATE TABLE data_export_requests (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_url TEXT,
  expires_at TIMESTAMPTZ
);

-- Data Deletion Requests
CREATE TABLE data_deletion_requests (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  retained_data TEXT[]
);

-- Uploaded Files Table
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  category VARCHAR(50),
  blob_url TEXT,
  executive VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);

-- RLS for compliance tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent/requests
CREATE POLICY "Users view own consent" ON consent_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own exports" ON data_export_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own deletions" ON data_deletion_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own files" ON uploaded_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own files" ON uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);
