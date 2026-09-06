# NeuroQuest (স্মৃতিযোদ্ধা)

> **Learn Once. Remember Forever.** — Bangladesh's first AI-native narrative learning platform defeating the cram-test-forget cycle.

![NeuroQuest Banner](https://img.shields.io/badge/AI--Native-Learning-purple?style=for-the-badge) ![Infinity AI BuildFest](https://img.shields.io/badge/Infinity%20AI%20BuildFest%202026-Top%20100%20Finalist-gold?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)

---

## 🏆 Infinity AI BuildFest 2026

**Team Buddhi.exe** advanced to the **Top 100 Finalist** round at **Infinity AI BuildFest 2026** (BRAC University, CloudCamp Bangladesh) — competing against 200+ teams building the next generation of AI solutions for Bangladesh.

**Competition Rubric Focus:**
- ✅ **Innovation:** First narrative-driven AI learning platform in Bangladesh
- ✅ **Technical Execution:** Gemini-powered diagnostics, story quest gameplay, gamification live
- ✅ **Business Model:** Freemium → B2B school licensing (proven SaaS path)
- ✅ **Real-World Impact:** NCTB curriculum, 1.5M annual HSC learners, defeating cram-test-forget cycle
- ✅ **Scalability & NRB:** Edge-native, multi-language, MCP extensible, diaspora partnership ready

---

## 🧠 The Problem

**35M+ school students in Bangladesh stuck in the cram-test-forget cycle:**
- 60–100 students per classroom → zero personalization
- Passive learning (lectures + PDFs) → 30% retention in a week
- 70–80% of board content forgotten within 90 days
- Foreign examples feel abstract to rural learners

---

## ✨ The Solution

### 3-Layer AI-Native Learning Engine

┌─────────────────────────────────────────────────────────┐
│ Layer 1: AI Diagnostic Assessment │
│ Gemini-powered concept profiling → personalized map │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Story Quest Gameplay │
│ Bangladesh-set narrative scenes → apply weak concepts │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Spaced Retrieval (Roadmap, Coming Next) │
│ Day 7/21/45 re-quizzes → defeat Ebbinghaus curve │
└─────────────────────────────────────────────────────────┘


**Result:** Students retain complex concepts as **natural, lifelong intuition** — not rote memory.

---

## 🎮 What's Live Right Now

### ✅ Fully Built & Playable

**Flagship Science Tracks:**
- **Physics Ch4** — "Rafi's Sirajganj Blackout" (Work, Power, Energy, PE↔KE, Conservation)
- **Biology Ch4** — "Tania's Rajshahi Mango Tree" (Photosynthesis, Respiration, ATP, Chlorophyll)
- 10+ story scenes × 2 chapters, animated backgrounds, cinematic narrative

**Curriculum Coverage:**
- 6 SSC subjects (Biology, Physics, Chemistry, ICT, History, Geography) × 2 chapters each = 12 seeded chapters
- IELTS (Writing Examiner, Reading, Listening modules live; Speaking coming soon)
- Medical (Part 1, Chapter 1 live; expanding)

**Gamification Engine:**
- XP system: +10 daily login, +30 quiz completion, +10/correct answer, +15/story scene, +50 quest bonus
- 4 Ranks: নবীন (0 XP) → যোদ্ধা (500 XP) → বীর (1500 XP) → মহাবীর (3000 XP)
- Streak tracking, progress visualization

**Auth & Security:**
- Email verification (OTP)
- Security question–based password reset (bcryptjs-hashed, 10 rounds)
- JWT-based sessions (HttpOnly, Secure cookies)
- Edge middleware protecting protected routes

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Backend** | Next.js API Routes, Edge Runtime, custom JWT (jose) |
| **Database** | Supabase (PostgreSQL) — 15 tables, UUID PKs, cascading FKs |
| **AI** | Google Gemini (multi-model fallback: 2.0-flash → 2.0-flash-001 → flash-latest → 2.5-flash) |
| **Agent Orchestration** | Custom MCP Server (Node/TypeScript, stdio) |
| **Deployment** | Netlify (primary), Vercel (configured) |
| **Validation** | Zod schemas, React Hook Form |
| **Email** | Resend (OTP delivery) |
| **Styling** | TailwindCSS, Lucide icons, Recharts (progress), Framer Motion (transitions) |

---

## 📊 Database Schema Snapshot

Users (auth, profile, gamification state)
├── Subjects (SSC, HSC, IELTS, Medical)
├── Chapters (seeded across 12+ chapters)
├── Concepts (per chapter, NCTB-mapped)
│ └── Concept_Proficiency (per user per concept: weak/developing/strong)
├── Diagnostic Sessions & Questions
├── Story Sessions & Progress (scene-by-scene tracking)
└── Student Selections (class, version, track preferences)


---

## 🚀 Live Demo

**🌐 [neuroquestweb.netlify.app](https://neuroquestweb.netlify.app)**

**Demo Account:**
- Email: `demo@example.com`
- Password: `DemoPassword123`

**Quick Start:**
1. Sign up (age 13–25, Bangla/English, SSC/HSC/IELTS/Medical)
2. Select "Physics" from Science subjects
3. Pick "Chapter 4: Work, Power and Energy"
4. Take the 6-question diagnostic quiz
5. Play the story quest (10 cinematic scenes, narrative-driven choices)
6. See your Knowledge Map & XP progress

---

## 🎯 Key Features

### ✨ For Students
- **Personalized Learning:** AI identifies weak concepts in 60 seconds
- **Narrative Immersion:** Story-based gameplay (not boring flashcards)
- **Bangladeshi Context:** Local settings, cultural references, mother-tongue support
- **Progress Tracking:** XP, ranks, streaks, concept mastery visualization
- **Bilingual Interface:** Seamless Bangla ↔ English switching

### 🛠️ For Developers
- **MCP Server Integration:** Read-only curriculum tools for LLM agents
- **Concept-Indexed RAG:** NCTB PDF → sliding-window chunking → concept injection
- **Modular Architecture:** Pluggable diagnostic, story, gamification engines
- **Edge-Safe Auth:** JWT with jose, no heavy dependencies
- **Open Source Ready:** MIT license, clear folder structure

---

## 📈 Roadmap

### Phase 2 (Next 3 months)
- ✅ **Spaced Retrieval:** Automated Day 7/21/45 re-quizzes (Ebbinghaus curve)
- ✅ **Deep Story Coverage:** Physics/Biology → expand to Chemistry, History
- ✅ **pgvector Embeddings:** True hybrid vector/keyword search for concepts
- ✅ **HSC Full Stack:** HSC chapters matching SSC depth

### Phase 3 (6 months)
- Teacher Dashboard: class analytics, auto-generated insights
- Freemium Model: free diagnostics + story quests; premium = spaced retrieval + analytics
- NRB Diaspora Partnerships: funding, mentorship from Bangladesh alumni
- B2B School Integration: bulk licensing for 100+ schools

---

## 💡 Why NeuroQuest Wins

| Angle | Why |
|-------|-----|
| **Innovation** | First AI-native *narrative* learning in Bangladesh (not just quiz platform) |
| **Execution** | 12 seeded chapters, 10 full story scenes, diagnostic engine live and tested |
| **Business Model** | Freemium → B2B school licensing + teacher tools (proven SaaS path) |
| **Impact** | Directly addresses NCTB curriculum, board exam prep, 1.5M annual HSC learners |
| **Scalability** | Next.js Edge + serverless, multi-language ready, MCP extensible |

---

## 🤝 Team Buddhi.exe

Built at **Infinity AI BuildFest 2026** (BRAC University, CloudCamp Bangladesh):
- **Shahriar Hossain Arafat** — Full-stack, cybersecurity analyst, AUST
- **Fahim** — Backend, AI orchestration
- **Tahsean Shuborna** — Product, curriculum design
- **Ritu (Meherun Nesa Nitu)** — Story design, UX

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
Supabase account (free tier works)
Google Gemini API key (free tier; quota recommended)
```

### Installation

```bash
# Clone repo
git clone https://github.com/ShArafat58/NeuroQuest-Hackathon-Project.git
cd NeuroQuest

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Fill in:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - GEMINI_API_KEY
# - NEXTAUTH_SECRET (run: openssl rand -hex 32)

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
npm run build
npm run start  # production mode

# Deploy to Netlify (already configured)
git push origin main  # auto-deploys
```

---

## 📚 Architecture & Code Tour

app/
├── (auth)/ # Public auth flows
│ ├── login/
│ ├── signup/
│ └── forgot-password/
├── (protected)/ # JWT-protected routes
│ ├── dashboard/
│ ├── select-subject/
│ ├── select-chapter/
│ ├── quiz/ # Diagnostic engine
│ ├── story/ # Story quest gameplay
│ └── settings/
├── api/ # Backend endpoints
│ ├── auth/
│ ├── quiz/
│ ├── story/
│ └── user/
└── (marketing)/ # Landing, docs

lib/
├── agents/
│ └── diagnostic-agent.ts # Gemini multi-model fallback
├── auth.ts # JWT, password hashing
├── xp.ts # XP award logic
├── rank.ts # Rank thresholds
├── supabase.ts # Client + server instances
└── validators.ts # Zod schemas

mcp-server/ # Standalone MCP tools
├── tools/
│ ├── list_subjects.ts
│ ├── list_chapters.ts
│ ├── get_concept.ts
│ └── list_story_scenes.ts
└── index.ts


---

## 🔐 Security Notes

- **RLS Disabled (currently)** — Roadmap: enable row-level security per user role
- **API Rate Limiting** — Implemented at edge for auth, pending for quiz endpoints
- **Gemini Fallback Chain** — Handles quota exhaustion gracefully (4-model fallback)
- **Password Hashing** — bcryptjs 10 rounds (Node runtime only, not Edge)

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🤗 Contributing

NeuroQuest is **open to collaboration:**

1. **Fork** the repo
2. Create a feature branch: `git checkout -b feature/spaced-retrieval-v2`
3. Commit: `git commit -m "Add spaced retrieval re-quiz engine"`
4. Push: `git push origin feature/spaced-retrieval-v2`
5. Open a Pull Request

**Want to add content?**
- NCTB chapters: add JSON to `data/curriculum/`
- Story scenes: create narrative JSON + upload background images
- Gemini prompts: improve `lib/agents/diagnostic-agent.ts`

---

## 🎓 Educational Philosophy

**NeuroQuest is built on:**
- **Ebbinghaus Forgetting Curve** — spaced retrieval combats decay
- **Contextual Learning** — Bangladesh-set stories anchor concepts to lived experience
- **Active Recall** — narrative choices require applying knowledge, not passive reading
- **Gamification Psychology** — XP + ranks + streaks sustain motivation without extrinsic pressure

---

## 📞 Support & Feedback

- **Issues:** [GitHub Issues](https://github.com/ShArafat58/NeuroQuest-Hackathon-Project/issues)
- **Email:** shahriararafat20@gmail.com
- **LinkedIn:** Team Buddhi.exe

---

## 🙏 Acknowledgments

- **NCTB** — Bangladesh National Curriculum & Textbook Board (curriculum mapping)
- **Google Gemini** — Multi-modal AI backbone
- **Supabase** — Open-source PostgreSQL hosting
- **Next.js & Vercel** — Full-stack framework
- **CloudCamp Bangladesh & BRAC University** — Infinity AI BuildFest 2026 platform

---

<div align="center">

**Learn Once. Remember Forever.** 🧠

Built with ❤️ by Team Buddhi.exe

[Live Demo](https://neuroquestweb.netlify.app) • [GitHub](https://github.com/ShArafat58/NeuroQuest-Hackathon-Project) • [Overview](/docs)

</div>
