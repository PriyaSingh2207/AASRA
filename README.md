# AASRA - Patient-First AI-Powered Dementia-Care Companion

> **"Simple for the patient. Powerful for the caregiver. Intelligent where it matters. Reliable where it counts."**

AASRA is a senior-friendly, multilingual, and offline-capable dementia-care platform tailored for Indian and Northeast Indian communities. It combines personalized cognitive support, voice-first daily assistance, memory preservation, medical organization, safe communication, and consent-based caregiver coordination.

---

## 🌟 Key Product Features

### 📱 1. Senior-Friendly Patient App Experience
- **Voice-First AI Assistant**: Uses Web Speech API (STT & TTS) with support for Indian & Northeast Indian regional context (English, Hindi, Assamese, Bengali, Manipuri, Mizo, Bodo, Nagamese).
- **"Today" Right-Now Dashboard**: Focuses on immediate next task/medicine, reducing cognitive overload.
- **Deterministic Smart Reminders**: Reliable scheduling for medicines (Taken / Skipped / Missed tracking) and daily hydration/walk routines.
- **4 Adaptive Cognitive Games**:
  - *Family Photo Recall*: Personalized family photo identification.
  - *Spatial Focus Match*: Attention and motor control.
  - *Daily Orientation Check*: Temporal awareness (Day, Time, Weather).
  - *Coin & Number Puzzle*: Accessible everyday arithmetic.
- **Memory Capsule**: Personal photo album and voice stories powering patient recall exercises.
- **AASRA Digital ID & Caregiver Pairing**: Secure identity badge with QR display and pairing credential passkeys.
- **1-Tap & Voice Emergency SOS**: Triggers loud audio distress beacon, shares live location coordinates, and notifies emergency contacts.
- **Patient-First Consent Controls**: Granular permission toggles for medicine visibility, cognitive metrics, memory edits, and location sharing with immutable audit logs.
- **Offline-First Resilience**: Full client-side LocalStorage/IndexedDB persistence engine with automatic background sync queue when connection is restored.

### 💻 2. Caregiver Web Dashboard
- **Patient Status & Adherence Header**: Real-time medication adherence gauge %, 6-domain cognitive index, emergency alerts, and network sync status.
- **Medication & Routine Scheduler**: Add and adjust patient medicines, dosage, times, and audio prompts.
- **AI Caregiver Insights**: Human-understandable observations ("Family Photo recall is strong at 88%; morning hydration reminders recommended") clearly labeled as supportive notes, not clinical diagnosis.
- **Medical Vault Curator**: Upload prescriptions, track lab test results, and doctor contacts.
- **Memory Capsule Curator**: Upload family photos, define relationship titles, and record contextual audio hints for patient games.
- **Consent Monitor & Access Audit**: Real-time permission tracking with access logs.

---

## 🏗️ Technical Architecture

```
AASRA/
├── backend/
│   ├── app.py                  # FastAPI REST Server & Static File Mount
│   ├── cognitive_engine.py     # 6-Domain Adaptive Difficulty Engine (Play -> Measure -> Analyze -> Adapt)
│   ├── reminder_engine.py      # Deterministic Reminder Scheduler & Adherence Calculation
│   ├── consent_manager.py      # Patient-First Permission Enforcement & Audit Log
│   ├── ai_service.py           # Multilingual Intent Parser & Caregiver Insights Synthesizer
│   └── data_store.py           # Persistent JSON DB Store & Seed Data
├── frontend/
│   ├── index.html              # Unified Platform Entrypoint (Patient App ↔ Caregiver Dashboard)
│   ├── css/
│   │   ├── main.css            # Design System, Glassmorphism, Senior High-Contrast Mode
│   │   ├── patient.css         # Patient Mobile Senior-Friendly Layout
│   │   └── caregiver.css       # Caregiver Dashboard Layout & Domain Progress Bars
│   └── js/
│       ├── app.js              # Master App Controller & Mode Router
│       ├── voice_assistant.js  # Web Speech API Voice Engine (STT & TTS)
│       ├── cognitive_games.js  # Interactive Cognitive Exercises
│       ├── memory_capsule.js   # Family Photo Recall & Audio Story Player
│       ├── reminders.js        # Schedule execution & voice prompts
│       ├── consent.js          # Digital ID, Pairing & Consent toggles
│       ├── emergency.js        # Voice & 1-Tap SOS workflow
│       ├── offline_sync.js     # Offline-First Storage & Auto-Sync Engine
│       └── caregiver_dashboard.js # Caregiver Stats, Routine Adder & Insights Viewer
└── README.md
```

---

## 🚀 How to Run AASRA V1

### Prerequisites
- Python 3.10+ (Managed via `uv` or system Python)

### Step 1: Start the Backend FastAPI Server
Run using `uv`:
```bash
& 'C:\Users\priya\.local\bin\uv.exe' run --python .venv\Scripts\python.exe backend/app.py
```
Or directly using python:
```bash
.venv\Scripts\python.exe backend/app.py
```

The FastAPI backend will start at: `http://127.0.0.1:8000`

### Step 2: Open AASRA Web Application
Open your browser and navigate to:
```
http://127.0.0.1:8000/app/index.html
```

Or open `frontend/index.html` directly in any modern web browser!

---

## 🧪 Verification & Testing
1. **Patient App Mode**:
   - Tap 🎙️ mic button or click "Voice-First AI Assistant". Speak or select prompt *"AASRA, what do I have to do today?"*.
   - Click "✓ I Have Taken This" on the next medicine hero card and listen to the voice confirmation.
   - Click **Mind Games** -> **Family Photo Match** to test interactive cognitive exercise & score adaptation.
   - Click **SOS HELP** or say *"AASRA HELP ME"* to trigger emergency beacon & simulated location broadcast.
2. **Caregiver Dashboard Mode**:
   - Toggle to **Caregiver Dashboard** mode using top mode switcher.
   - View real-time Routine Adherence % and Cognitive Domain Radar metrics.
   - Click **+ Add Medication** to add a new medicine reminder.
   - Inspect **AI Support Insights** and **Consent & Permission Audit Log**.
3. **Offline Sync Test**:
   - Toggle High Contrast / Language settings.
   - Disconnect network or click Network indicator to simulate offline mode.
   - Perform actions, reconnect, and observe auto-sync to backend.
