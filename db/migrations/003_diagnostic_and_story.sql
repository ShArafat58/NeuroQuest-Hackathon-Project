-- ============================================================
-- DIAGNOSTIC SYSTEM
-- ============================================================

CREATE TABLE diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  version TEXT NOT NULL CHECK (version IN ('bangla', 'english')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  total_questions INTEGER DEFAULT 6,
  correct_count INTEGER DEFAULT 0,
  current_question_index INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  ai_insight TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_diag_sessions_user ON diagnostic_sessions(user_id);
CREATE INDEX idx_diag_sessions_chapter ON diagnostic_sessions(chapter_id);

CREATE TABLE diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diag_questions_session ON diagnostic_questions(session_id);

CREATE TABLE diagnostic_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  selected_answer CHAR(1) CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN DEFAULT false,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diag_answers_session ON diagnostic_answers(session_id);

CREATE TABLE concept_proficiency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  diagnostic_session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE SET NULL,
  proficiency_score INTEGER NOT NULL DEFAULT 0 CHECK (proficiency_score BETWEEN 0 AND 100),
  mastery_level TEXT NOT NULL DEFAULT 'unassessed' CHECK (mastery_level IN ('weak', 'developing', 'strong', 'unassessed')),
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, concept_id)
);

CREATE INDEX idx_proficiency_user ON concept_proficiency(user_id);

-- ============================================================
-- STORY SYSTEM
-- ============================================================

CREATE TABLE story_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  scene_index INTEGER NOT NULL,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  narrative_bn TEXT NOT NULL,
  narrative_en TEXT NOT NULL,
  concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
  question_bn TEXT NOT NULL,
  question_en TEXT NOT NULL,
  option_a_bn TEXT NOT NULL,
  option_a_en TEXT NOT NULL,
  option_b_bn TEXT NOT NULL,
  option_b_en TEXT NOT NULL,
  option_c_bn TEXT NOT NULL,
  option_c_en TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c')),
  explanation_bn TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  icon_name TEXT DEFAULT 'sparkles',
  UNIQUE(chapter_id, scene_index)
);

CREATE INDEX idx_scenes_chapter ON story_scenes(chapter_id);

CREATE TABLE story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  diagnostic_session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE SET NULL,
  version TEXT NOT NULL CHECK (version IN ('bangla', 'english')),
  current_scene_index INTEGER DEFAULT 0,
  total_scenes INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  scenes_completed INTEGER DEFAULT 0,
  correct_choices INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_story_sessions_user ON story_sessions(user_id);

CREATE TABLE story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES story_sessions(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES story_scenes(id) ON DELETE CASCADE,
  selected_option CHAR(1),
  is_correct BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_story_progress_session ON story_progress(session_id);
