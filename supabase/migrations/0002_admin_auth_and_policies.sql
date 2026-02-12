CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_annotators ON annotators;
CREATE POLICY deny_all_annotators ON annotators
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_meme_bank ON meme_bank;
CREATE POLICY deny_all_meme_bank ON meme_bank
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_meme_reviews ON meme_reviews;
CREATE POLICY deny_all_meme_reviews ON meme_reviews
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_admins ON admins;
CREATE POLICY deny_all_admins ON admins
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
