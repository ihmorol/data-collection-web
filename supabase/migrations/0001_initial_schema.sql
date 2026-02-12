CREATE TABLE IF NOT EXISTS annotators (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 100),
  political_outlook TEXT NOT NULL
    CHECK (political_outlook IN ('Progressive','Moderate','Conservative','Apolitical')),
  religious_perspective TEXT NOT NULL
    CHECK (religious_perspective IN ('Not Religious','Moderately Religious','Very Religious')),
  internet_literacy TEXT NOT NULL
    CHECK (internet_literacy IN ('Casual User','Meme Savvy','Chronically Online')),
  dark_humor_tolerance INTEGER NOT NULL CHECK (dark_humor_tolerance BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meme_bank (
  id SERIAL PRIMARY KEY,
  image_name TEXT UNIQUE NOT NULL,
  caption TEXT NOT NULL,
  ground_truth_label TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS meme_reviews (
  id SERIAL PRIMARY KEY,
  annotator_id INTEGER NOT NULL REFERENCES annotators(id) ON DELETE CASCADE,
  meme_id INTEGER NOT NULL REFERENCES meme_bank(id) ON DELETE CASCADE,
  perception TEXT NOT NULL
    CHECK (perception IN ('Very Negative','Negative','Neutral','Positive','Very Positive')),
  is_offensive TEXT NOT NULL
    CHECK (is_offensive IN ('Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree')),
  contains_vulgarity BOOLEAN NOT NULL,
  primary_target TEXT NOT NULL
    CHECK (primary_target IN ('None/General','Political Figure','Religious Group','Gender/Identity','Individual')),
  moderation_decision TEXT NOT NULL
    CHECK (moderation_decision IN ('Keep','Flag/Filter','Remove')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (annotator_id, meme_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_annotator ON meme_reviews(annotator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_meme ON meme_reviews(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_bank_order ON meme_bank(display_order);

ALTER TABLE annotators ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_reviews ENABLE ROW LEVEL SECURITY;
