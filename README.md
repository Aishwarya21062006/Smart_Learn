# SmartLearn: AI-Powered Personalized Learning Platform

A full-stack, free-tier web application where students study topics, take quizzes, track progress, interact with an AI tutor, and explore anime-style visual novel explainers when stuck.

---

## 1. Tech Stack (All Free Tiers)

- **Client**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React, Recharts
- **Server**: Node.js (ES modules), Express, Zod, Helmet, CORS, Express-Rate-Limit, Dotenv
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, pgvector) with `@supabase/supabase-js`
- **AI / LLM**: Google Gemini API free tier through `@google/genai` (called server-side only)
- **Voice**: Browser Web Speech API (`SpeechSynthesis`)

---

## 2. Project Structure

```
smartlearn/
├── README.md                 # Setup, env vars, run, demo script, test checklist
├── .gitignore                # node_modules, .env, dist
├── supabase/
│   └── schema.sql            # Database schema, tables, triggers, RLS & functions
├── client/                   # Vite + React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Client routes
│       ├── index.css         # Tailwind base styles
│       ├── lib/
│       │   └── supabaseClient.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── routes/
│       │   ├── ProtectedRoute.jsx
│       │   └── AdminRoute.jsx
│       ├── services/
│       │   ├── api.js        # Axios instance with Supabase token interceptor
│       │   └── authService.js
│       ├── components/
│       │   ├── layout/       # Layout.jsx, Navbar.jsx
│       │   └── common/       # Button, Card, Loader, EmptyState, ErrorMessage
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx # Dashboard shell
│           ├── NotFound.jsx
│           └── admin/
│               └── AdminDashboard.jsx
└── server/                   # Express API Server
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js         # Entry point (port 5000)
        ├── app.js            # Express app, middleware & route registration
        ├── config/
        │   ├── env.js        # Environment config loader
        │   ├── supabase.js   # Supabase client with service role key
        │   └── gemini.js     # Google GenAI client instance
        ├── middleware/
        │   ├── auth.js       # Supabase JWT token verification & req.user profile
        │   ├── requireAdmin.js # Admin role authorization check
        │   ├── rateLimit.js  # Global 100 req/15min limiter
        │   ├── validate.js   # Zod request validation
        │   └── errorHandler.js # Global error handler returning { "error": "message" }
        ├── routes/
        │   ├── index.js      # /api router with /api/health
        │   └── me.routes.js  # /api/me route
        ├── controllers/
        │   └── me.controller.js
        └── utils/
            ├── AppError.js   # Operational error class
            ├── asyncHandler.js # Async wrapper for controllers
            └── logger.js     # Safe console logger without secret leakage
```

---

## 3. Environment Variables

### Server (`server/.env`)
Create `server/.env` with:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBED_MODEL=text-embedding-004
TUTOR_DAILY_LIMIT=20
USE_LLM_FOR_REASON=false
```

### Client (`client/.env`)
Create `client/.env` with:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Supabase Database Setup

1. Create a free project at [database.new](https://database.new) (Supabase).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of [supabase/schema.sql](file:///supabase/schema.sql).
4. In **Project Settings > API**, copy:
   - Project URL -> `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon` `public` key -> `VITE_SUPABASE_ANON_KEY`
   - `service_role` `secret` key -> `SUPABASE_SERVICE_ROLE_KEY` (never share this in client)

### Making Yourself an Admin
1. Register in the SmartLearn app using your email.
2. In the Supabase SQL Editor, run:
```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

---

## 5. Running Locally

### Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Run the Backend (Port 5000)
```bash
cd server
npm run dev
```

### Run the Frontend (Port 5173)
```bash
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Phase 1 Test Checklist

- [x] **Scaffolding & Architecture**: Client and server structured with JavaScript ES modules.
- [x] **Database Schema**: `supabase/schema.sql` created containing all 12 tables, vector extension, search functions, triggers, and Row Level Security.
- [x] **API Health Check**: `GET /api/health` returns `200 OK` with `{ status: "ok", service: "SmartLearn API", time: "..." }`.
- [x] **Auth Middleware**: `requireAuth` verifies Supabase JWT token and extracts profile (`id, name, role`).
- [x] **Admin Middleware**: `requireAdmin` restricts admin routes to users with `role === 'admin'`.
- [x] **Global Error Handler**: Returns standard `{ "error": "message" }` format without exposing secrets.
- [x] **Profile Endpoint**: `GET /api/me` returns the authenticated user's profile and role.
- [x] **Client Auth Context**: Manages session state, auto-refreshes, and stores user profile.
- [x] **Route Protection**: `ProtectedRoute` protects student pages; `AdminRoute` protects admin pages.
- [x] **Register & Login Flow**: Clean UI forms with loading and error states.
- [x] **Responsive Layout & Dashboard Shell**: Mobile-first navigation bar with role badge, logout, and dashboard shells.

---

## 7. Phase 2 Test Checklist

- [x] **Admin Subject CRUD**:
  - Open `/admin/subjects`
  - Click **Add Subject**, enter a title and description, and submit.
  - The subject appears in the subjects grid with a topic count of 0.
  - Edit and Delete subject actions work.
- [x] **Admin Topic & Resource CRUD**:
  - Open `/admin/topics` (or click "View Topics" on a subject card).
  - Click **Add Topic**, select the subject, set title, difficulty, sort position, write notes, and add resources (video, article, pdf, or link).
  - Save the topic. Content is automatically split into ~500 character chunks for vector search.
  - Edit, Delete, and Re-index actions operate as expected.
- [x] **Admin Dashboard Stats**:
  - `/admin` displays live real-time counts for subjects and topics from `GET /api/admin/stats`.
- [x] **Student Subject Browsing**:
  - Go to `/subjects`. The student sees the newly created subject card with description and progress bar.
- [x] **Student Subject Detail**:
  - Click on the subject card to open `/subjects/:id`.
  - Topics are listed with difficulty badges, sort sequence, and status (`Not Started` initially).
- [x] **Topic Page & Progress Update**:
  - Click **Study** on any topic to open `/topics/:id`.
  - The topic notes and external resource links are cleanly rendered.
  - The backend `GET /api/topics/:id` automatically marks the topic as `in_progress` in `topic_progress`.
  - Returning to `/subjects/:id` shows the topic status badge updated to `In Progress`.
  - Action buttons are present for "I didn't understand this" (explainer) and "Take Quiz".

---

## 8. Phase 3 Test Checklist

- [x] **Admin Questions CRUD**:
  - Open `/admin/questions`.
  - Select a Subject and Topic from the dropdowns.
  - Click **Add Question**, enter question text, 4 options, click the circle to designate the correct answer, add an explanation, and save.
  - Edit and Delete question actions work.
- [x] **Quiz Engine Security (Withheld Answers)**:
  - `GET /api/topics/:id/quiz` returns up to 10 shuffled questions.
  - Confirmed: `correct_index` and `explanation` are strictly stripped from the response.
- [x] **Take Quiz Workflow**:
  - Click **Take Quiz** on any topic page or topic card to open `/topics/:id/quiz`.
  - Question stepper shows progress; answer choices are selectable.
  - Click **Submit Quiz**. The server grades answers, records an attempt, updates exponential mastery, and displays the `QuizResultSummary`.
- [x] **Mastery Algorithm**:
  - First attempt: `mastery = score`.
  - Subsequent attempts: `mastery = 0.6 * score + 0.4 * old_mastery`.
  - Labels: Weak (< 50), Average (50-74), Strong (≥ 75).
  - Status becomes `completed` once any score reaches 60% or more (never reverts).
- [x] **Explainer Recommendation**:
  - If score is under 50%, a prominent banner appears: *"Since your score was below 50%, Sensei Hana and Ren have prepared a short visual-novel anime story"*, linking directly to the explainer.
- [x] **Student Analytics & Progress Page**:
  - Click **Progress** in the navbar to open `/progress`.
  - Average mastery, completed topics, strong topics, and weak topics are computed.
  - Recharts bar chart visualizes score progression across attempts.
  - Priority Revision List flags weak topics for review.
  - Attempt history log displays date, topic, score, and correct count.

---

## 9. Phase 4 Test Checklist: Adaptive AI Recommendations

- [x] **Rule-Based Pedagogical Priority Queue**:
  - `server/src/services/recommendation.service.js` classifies topics into 4 prioritized queues:
    1. Weak Topics (`mastery < 40%`)
    2. Next sequential topic in active subject (`position > currentPosition`)
    3. Unstarted topics
    4. Reinforce topics (`40% <= mastery < 80%`)
- [x] **Recommendation Endpoint**:
  - `GET /api/recommendations` returns top personalized recommendations with pedagogical `reason` strings.
- [x] **Dashboard Recommendation Cards**:
  - `client/src/components/learning/RecommendationCard.jsx` visualizes recommendation tier badge, difficulty, reason, and direct "Study Notes" / "Take Quiz" action buttons.
  - Dynamic live stats on `Dashboard.jsx` for active subjects, average mastery %, and topics attempted.

---

## 10. Phase 5 Test Checklist: Anime Explainer & Visual Novel

- [x] **StoryPlayer Component**:
  - Visual-novel stage with Sensei Hana and Ren character avatars.
  - Emotion-reactive portraits (Thinking, Explaining, Surprised, Happy, Attentive).
  - Scene stepper with previous/next controls, visual stage directions, and animated dialogue box.
- [x] **SpeechSynthesis Voice Narration**:
  - Browser Web Speech API (`SpeechSynthesis`) voice toggle with speaker pitch modulation (higher pitch for Sensei Hana, student pitch for Ren).
- [x] **Comprehension Checkpoint & Feedback**:
  - Interactive checkpoint question with instant answer reveal and explanation.
  - Thumbs up/down feedback saved to `explainer_feedback` table.
- [x] **Backend Explainer Service & LLM Generation**:
  - `GET /api/topics/:id/explainer` generates or serves cached 6-to-8 scene storyboards from `public.explainers`.
  - High-yield real-world analogies generated with Gemini.

---

## 11. Phase 6 Test Checklist: AI Curriculum Tutor & RAG

- [x] **Hybrid Vector & Text Search (RAG)**:
  - Generates 768-dimension embeddings with `gemini-embedding-001`.
  - Searches `content_chunks` via Supabase RPC `match_chunks` (cosine distance) and `search_chunks_text` (tsvector full-text search).
- [x] **Daily 20-Message Quota**:
  - Enforced per student per UTC day in `public.tutor_usage`.
  - Endpoint `GET /api/tutor/usage` and live quota counter pill in the UI.
- [x] **Interactive Tutor Interface**:
  - Accessible at `/tutor`.
  - Displays grounding source badges (e.g. `📚 Grounded in: 01 RM Module 1 (1)`).
  - Quick prompt chips for instant viva and curriculum preparation questions.

---

## 12. College Viva Demonstration Guide

1. **Architecture & Tech Stack Walkthrough**:
   - Explain client-server separation (React + Vite & Express ES modules).
   - Show Supabase PostgreSQL schema with pgvector (12 tables, RLS security policies, vector indexing).
2. **Curriculum & PDF Upload Demo**:
   - Go to `/admin/topics` &rarr; Show drag-and-drop PDF upload.
   - Explain how `PDFParse` and multimodal Gemini automatically convert slides/PDFs into structured curriculum notes and 768-dim vector embeddings.
3. **Interactive Quiz & Exponential Mastery Demo**:
   - Take a quiz on any topic &rarr; Show that correct answers are strictly withheld by the server until submission.
   - Submit the quiz &rarr; Explain the exponential moving average mastery formula:
     $$\text{Mastery}_{t} = 0.6 \times \text{Score} + 0.4 \times \text{Mastery}_{t-1}$$
4. **Anime Visual-Novel Explainer Demo**:
   - Score below 50% or click *"I didn't understand this"* &rarr; opens `/explainer/:topicId`.
   - Show Sensei Hana and Ren breaking down concepts with analogies, voice toggle (Web Speech API), and comprehension check question.
5. **AI Tutor RAG Chat Demo**:
   - Open `/tutor` &rarr; Ask a question about the uploaded document.
   - Show source citation pill proving the answer is grounded in the student's actual notes, along with the daily 20-message quota tracker.
