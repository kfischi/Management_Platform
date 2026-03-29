-- Migration 003: Add netlify_build_hook per site
ALTER TABLE sites ADD COLUMN IF NOT EXISTS netlify_build_hook TEXT;
