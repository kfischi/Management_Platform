-- ─────────────────────────────────────────────
-- Migration 004: Automations v2
-- Adds workflow_json to automations + workflow_runs table
-- ─────────────────────────────────────────────

-- Add workflow_json column to store the full visual workflow
ALTER TABLE automations
  ADD COLUMN IF NOT EXISTS workflow_json  jsonb        DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS tags           text[]       DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS n8n_synced_at  timestamptz,
  ADD COLUMN IF NOT EXISTS error_count    integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error     text;

-- ─────────────────────────────────────────────
-- Workflow runs (execution history)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_runs (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id   uuid          REFERENCES automations(id) ON DELETE CASCADE,
  status          text          NOT NULL DEFAULT 'running'
                                CHECK (status IN ('running','success','failed','cancelled')),
  trigger_type    text,
  trigger_data    jsonb,
  output          jsonb,
  error_message   text,
  duration_ms     integer,
  steps_total     integer       NOT NULL DEFAULT 0,
  steps_done      integer       NOT NULL DEFAULT 0,
  started_at      timestamptz   NOT NULL DEFAULT now(),
  finished_at     timestamptz,
  started_by      uuid          REFERENCES auth.users(id),
  n8n_execution_id text
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_automation ON workflow_runs(automation_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status     ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started    ON workflow_runs(started_at DESC);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to workflow_runs"
  ON workflow_runs FOR ALL
  USING (get_user_role() = 'admin');

-- ─────────────────────────────────────────────
-- Automation templates seed data
-- ─────────────────────────────────────────────
-- (Templates stored as automations with trigger_type='template')
-- Actual seed done via application, not here.
