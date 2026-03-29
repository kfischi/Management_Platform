-- ============================================================
-- Migration 002: CMS - Content Management System
-- Allows clients to edit their website content like WordPress/Wix
-- ============================================================

-- -------------------------
-- site_pages: Pages of each website (home, about, contact, etc.)
-- -------------------------
CREATE TABLE IF NOT EXISTS site_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,                    -- 'home', 'about', 'contact', 'services'
  title       TEXT NOT NULL,                    -- display name in editor
  meta_title  TEXT,                             -- SEO title
  meta_desc   TEXT,                             -- SEO description
  is_published BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- -------------------------
-- content_blocks: Sections inside each page
-- -------------------------
CREATE TABLE IF NOT EXISTS content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL,     -- 'hero','text','image','gallery','cta','contact','services','faq','testimonials','video'
  label       TEXT,              -- friendly name for admin ("כותרת ראשית")
  content     JSONB NOT NULL DEFAULT '{}',  -- block-specific JSON data
  order_index INT NOT NULL DEFAULT 0,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  is_editable BOOLEAN NOT NULL DEFAULT true,  -- admin can lock a block from editing
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------
-- site_settings: Global per-site settings (colors, logo, contact info, social links, etc.)
-- -------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id   UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  key       TEXT NOT NULL,      -- 'colors', 'fonts', 'logo', 'contact', 'social_links'
  value     JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, key)
);

-- -------------------------
-- Auto-update timestamps
-- -------------------------
CREATE TRIGGER set_updated_at_site_pages
  BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_content_blocks
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_site_settings
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------
-- Indexes
-- -------------------------
CREATE INDEX idx_site_pages_site_id ON site_pages(site_id);
CREATE INDEX idx_content_blocks_page_id ON content_blocks(page_id);
CREATE INDEX idx_content_blocks_site_id ON content_blocks(site_id);
CREATE INDEX idx_site_settings_site_id ON site_settings(site_id);

-- -------------------------
-- Row Level Security
-- -------------------------
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- site_pages policies
CREATE POLICY "Admin full access on site_pages"
  ON site_pages FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "Client read own site pages"
  ON site_pages FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Client update own site pages"
  ON site_pages FOR UPDATE
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- content_blocks policies
CREATE POLICY "Admin full access on content_blocks"
  ON content_blocks FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "Client read own content blocks"
  ON content_blocks FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Client update own editable content blocks"
  ON content_blocks FOR UPDATE
  USING (
    is_editable = true AND
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- site_settings policies
CREATE POLICY "Admin full access on site_settings"
  ON site_settings FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "Client read own site settings"
  ON site_settings FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Client update own site settings"
  ON site_settings FOR UPDATE
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );
