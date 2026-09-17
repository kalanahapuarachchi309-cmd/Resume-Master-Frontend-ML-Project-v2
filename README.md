# Resume Master Frontend: React 18 Candidate Evaluation Portal

Modern Single Page Application (SPA) for the **Resume Master AI Screening & Candidate Matching System**, built with React 18, Vite, Tailwind CSS, and Lucide Icons.

---

## 🌟 Key Features

- **Role-Based Authentication:**
  - Secure JWT authentication with session persistence.
  - Dedicated candidate and recruiter views with protected client-side routes.
- **Job Requisition Management:**
  - Interactive job discovery board with keyword search and experience filtering.
  - Recruiter interface to publish job openings with interactive skill tag chips.
- **AI Resume Ingestion & Live Preview:**
  - Drag-and-drop resume upload supporting PDF and DOCX documents.
  - Instant parsing preview displaying candidate name, extracted technical skills, calculated experience, and highest education degree.
- **Machine Learning Match Leaderboard:**
  - Candidate ranking with score progress bars (0–100%).
  - Transparent skill gap breakdown: **Matched Skills (Green pills)** vs **Missing Skills (Red pills)**.
  - Explainable AI breakdown (TF-IDF Similarity, Skill Overlap %, Experience Delta, Education Match).

---

## 🛠️ Technology Stack

- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Routing:** React Router v6 (`react-router-dom`)
- **HTTP Client:** Axios with JWT Bearer request interceptor
- **Backend Service:** FastAPI REST Engine (`http://localhost:8000`)

---

## 📂 Frontend Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation bar with user profile & logout
│   │   └── ProtectedRoute.jsx    # Client-side route guard checking authentication & roles
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state provider, token sync & user sessions
│   ├── pages/
│   │   ├── Login.jsx             # User login with credentials
│   │   ├── Register.jsx          # Candidate and Recruiter account registration
│   │   ├── Dashboard.jsx         # Overview dashboard & system metrics
│   │   ├── AdminDashboard.jsx    # Administrative user management
│   │   ├── JobsList.jsx          # Job board with filters, search, and pagination
│   │   ├── CreateJob.jsx         # Interactive job creation form with skill tags
│   │   ├── ResumeUpload.jsx      # Resume file uploader with live extraction preview
│   │   └── MatchingDashboard.jsx # ML ranking leaderboard & explainability modal
│   ├── services/
│   │   └── api.js                # Axios instance with Bearer token interceptor
│   ├── App.jsx                   # Application router & layout
│   ├── index.css                 # Tailwind CSS utility imports
│   └── main.jsx                  # React DOM mount point
├── index.html                    # HTML document entrypoint
├── package.json                  # NPM dependencies & scripts
├── tailwind.config.js            # Tailwind theme configurations
└── vite.config.js                # Vite build and dev server settings
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
Static assets will be compiled to the `dist/` directory.
