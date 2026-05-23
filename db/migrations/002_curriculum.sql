-- Subjects table (lookup table for curriculum subjects)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('ssc', 'hsc_1', 'hsc_2')),
  paper TEXT CHECK (paper IN ('1st', '2nd')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_bn TEXT,
  summary_en TEXT,
  page_start INT,
  page_end INT,
  pdf_status TEXT DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'ingesting', 'ingested', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, chapter_number)
);

CREATE INDEX idx_chapters_subject ON chapters(subject_id);

-- Concepts table
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_concepts_chapter ON concepts(chapter_id);

-- Chapter text chunks (for RAG)
CREATE TABLE chapter_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  version TEXT NOT NULL CHECK (version IN ('bangla', 'english')),
  chunk_index INT NOT NULL,
  chunk_text TEXT NOT NULL,
  page_number INT,
  token_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chapter_chunks_chapter ON chapter_chunks(chapter_id, version);

-- Student selections (current subject + chapter user is studying)
CREATE TABLE student_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  current_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_selections_user ON student_selections(user_id);
