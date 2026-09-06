# AASRA - Sovereign Multilingual AI & Cognitive Dementia-Care Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-PriyaSingh2207%2FAASRA-blue?logo=github)](https://github.com/PriyaSingh2207/AASRA)
[![Python](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-16_Indic_Languages-orange)](https://www.sarvam.ai/)
[![Groq LPU](https://img.shields.io/badge/Groq_LPU-Dynamic_Difficulty-purple)](https://groq.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_ACID-003B57.svg?logo=sqlite)](https://www.sqlite.org/)

> **"Simple for the patient. Powerful for the caregiver. Intelligent where it matters. Reliable where it counts."**

**AASRA** is a patient-first, culturally-grounded, multilingual dementia care and cognitive rehabilitation platform tailored for Indian and Northeast Indian communities. It seamlessly bridges sovereign Indian AI models (**Sarvam AI**), ultra-fast inference (**Groq / Grok LPU**), deterministic smart routines, offline data resilience, and multi-role authentication.

---

## 🌟 Core Highlights & Architectural Pillars

### 1. 🇮🇳 Sovereign Multilingual AI Suite (Sarvam AI)
- **16 Indian Languages**: Hindi, Bengali, Assamese, Manipuri, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, and more.
- **Bulbul:v3 Neural TTS**: Natural regional voice synthesis with adjustable calm pacing (`0.88x`) suited for elderly auditory processing.
- **Saaras:v1 Voice STT & Mayura:v1 Translation**: Effortless voice command parsing and cross-lingual translation.

### 2. ⚡ Groq LPU / Grok High-Speed Cognitive Engine
- **Real-Time Dynamic Difficulty Adaptation (1.0 to 5.0 scale)**: Evaluates response latency, completion accuracy, and frustration signals in real time to tune visual distractor counts and clue delays.
- **Dynamic Personalized Challenge Generation**: Generates customized reminiscence questions and culturally familiar cognitive tasks.
- **Clinical Trajectory & Caregiver Insights**: Generates actionable, supportive summaries for family members and attending neurologists.

### 3. 🧠 8 Clinical-Grade Dementia Cognitive Games
1. **Family Photo Recall** (`photo_recall`) &mdash; *Episodic Memory & Facial Recognition*
2. **Gentle Target Focus** (`spatial_focus`) &mdash; *Visual Attention & Spatial Tracking*
3. **Clock & Season Check** (`time_quiz`) &mdash; *Temporal & Environmental Orientation*
4. **Coin & Tea Cup Numbers** (`math_puzzle`) &mdash; *Gentle Mental Arithmetic & Problem Solving*
5. **Herbal & Garden Match** (`plant_match`) &mdash; *Semantic Memory & Natural World Association*
6. **Familiar Phrase Completion** (`word_association`) &mdash; *Language Fluency & Proverb Recall*
7. **Nature Chime Sequence** (`sequence_recall`) &mdash; *Working Memory & Auditory Retention*
8. **Morning Tea Tray Sorter** (`daily_categorization`) &mdash; *Category Sorting & Executive Function*

### 4. 🔐 Multi-Role Authentication & Access Control
- **Elderly Patient**: 4-digit high-contrast tactile PIN (`8492`) linked to Digital Health ID (`AASRA-8921-IND`).
- **Caregiver**: 1-Tap Pairing Code (`ASR-8492`) or password authentication (`rahul@aasra.care` / `Caregiver@123`).
- **Doctor / Clinician**: Dedicated physician portal (`dr.barua@shillongneuro.org` / `Doctor@123`).
- **Real User Registration**: PBKDF2 HMAC-SHA256 password hashing with SQLite token management.

### 5. 🛡️ Patient-First Consent & Emergency SOS
- **Granular Consent Toggles**: Patient controls caregiver access to medication logs, cognitive scores, memories, and location.
- **Immutable Audit Trail**: Logs every permission modification and caregiver view action.
- **1-Tap & Voice SOS**: High-decibel distress beacon, GPS location broadcast, and caregiver alert dispatch.

---

## 🏗️ Repository Structure

```
AASRA/
├── backend/
│   ├── app.py                  # FastAPI REST Server & Static File Mount
│   ├── auth_service.py         # Multi-Role Auth, PBKDF2 Hashing & Token Sessions
│   ├── cognitive_engine.py     # 6-Domain Dementia Evaluation & Scoring Rules
│   ├── database.py             # SQLite Engine with 11 Tables & Thread-Safe Connection Pool
│   ├── data_store.py           # Unified Database Facade & Seed Initialization
│   ├── groq_service.py         # Groq LPU / Grok AI Dynamic Difficulty & Clinical Insights
│   ├── reminder_engine.py      # Deterministic Reminder Scheduler & Adherence Analytics
│   ├── sarvam_service.py       # Sarvam AI (Bulbul TTS, Saaras STT, Mayura Translation)
│   ├── ai_service.py           # Natural Language Intent Classifier & Fallback Engine
│   ├── consent_manager.py      # Patient-First Consent Enforcement & Audit Logs
│   └── tests_verify.py         # End-to-End System Verification Suite
├── frontend/
│   ├── index.html              # Unified Single-Page Application (Patient & Caregiver)
│   ├── assets/
│   │   └── aasra_logo.jpg      # Official AASRA Branding Logo
│   ├── css/
│   │   ├── main.css            # Design System, High Contrast, Theme Variables
│   │   ├── patient.css         # Senior-Friendly Touch UI & Big Tactile Buttons
│   │   └── caregiver.css       # Caregiver Dashboard, Clinical Graphs & Forms
│   └── js/
│       ├── app.js              # Master Application Controller & Navigation
│       ├── auth.js             # Client Auth Modal, Senior PIN Pad & Session Handler
│       ├── cognitive_games.js  # 8 Interactive Cognitive Game Renderers & Groq Hooks
│       ├── caregiver_dashboard.js # Caregiver Metrics, Routine Scheduler & AI Insights
│       ├── voice_assistant.js  # Multilingual Voice Engine (Web Speech & Sarvam AI)
│       ├── reminders.js        # Daily Schedule, Medicine Tracker & Adherence Engine
│       ├── memory_capsule.js   # Family Photo Album & Voice Story Player
│       ├── consent.js          # Digital Health ID & Granular Privacy Permissions
│       ├── emergency.js        # Voice & 1-Tap Emergency SOS Broadcast
│       ├── i18n.js             # 16-Language Multilingual Localization Dictionary
│       └── offline_sync.js     # IndexedDB / LocalStorage Offline Queue & Auto-Sync
├── .env.example                # Environment Variable Template
├── .gitignore                  # Git Ignore Rules (Protects .env, .venv, *.db)
└── README.md                   # Project Documentation
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/PriyaSingh2207/AASRA.git
cd AASRA
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install fastapi uvicorn requests
```

### 3. Configure Environment Variables
Copy the template and insert your API keys:
```bash
cp .env.example .env
```
Inside `.env`:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROK_API_KEY=your_groq_api_key_here
```

### 4. Launch AASRA Backend
```bash
python backend/app.py
```
*The server starts at `http://127.0.0.1:8000`.*

### 5. Open AASRA Application
Navigate to `http://127.0.0.1:8000/app/index.html` in your browser.

---

## 🧪 Run System Integration Tests

To verify that all 7 core modules (Groq LPU, Sarvam AI, Auth, 8 Games, SQLite DB) are operational:
```bash
python backend/tests_verify.py
```

---

## 👥 Default Demo Credentials

| Role | Name | Identifier / Email | PIN / Password / Code |
| :--- | :--- | :--- | :--- |
| **Patient** | Savitri Devi | `savitri` / `AASRA-8921-IND` | PIN: `8492` |
| **Primary Caregiver** | Rahul Sharma | `rahul@aasra.care` | Password: `Caregiver@123` \| Code: `ASR-8492` |
| **Attending Doctor** | Dr. Sunita Barua | `dr.barua@shillongneuro.org`| Password: `Doctor@123` |
