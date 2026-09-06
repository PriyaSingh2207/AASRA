import time
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from data_store import db
from cognitive_engine import cognitive_engine
from reminder_engine import reminder_engine
from consent_manager import consent_manager
from ai_service import ai_service
from sarvam_service import sarvam_service
from groq_service import groq_service, grok_service
from auth_service import auth_service

app = FastAPI(
    title="AASRA Dementia-Care Companion API",
    description="Production-ready FastAPI microservices providing SQLite persistence, deterministic scheduling, consent enforcement, cognitive adaptive loops, and Sarvam AI multilingual foundation models.",
    version="1.2.0"
)

# CORS middleware for local frontend development and web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount frontend directory for static serving
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/")
def read_root():
    return RedirectResponse(url="/app/")

@app.get("/api/health")
def health_check():
    stats = db.get_db_stats()
    sarvam_stat = sarvam_service.get_status()
    groq_stat = groq_service.get_status()
    return {
        "status": "ok",
        "app": "AASRA V1.5",
        "database": "SQLite (aasra.db)",
        "ai_engine": "Sarvam AI + Groq LPU Sovereign Medical Suite",
        "sarvam_status": sarvam_stat,
        "groq_status": groq_stat,
        "db_stats": stats,
        "timestamp": time.time()
    }

# ------------------------------------------------------------------
# 0. AUTHENTICATION & ACCESS CONTROL APIS
# ------------------------------------------------------------------
@app.post("/api/auth/register")
def register_user(payload: dict = Body(...)):
    """Registers a real new patient, caregiver, or doctor."""
    try:
        new_user = db.register_user(payload)
        session = db.create_session(new_user["id"], new_user["role"])
        return {
            "status": "success",
            "message": "Account created successfully",
            "session": session
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/api/auth/login")
def login_user(payload: dict = Body(...)):
    """Email or Username + Password authentication for Caregivers & Doctors."""
    identifier = payload.get("identifier", "").strip()
    password = payload.get("password", "")
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Username/Email and password are required")

    user = db.authenticate_user(identifier, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username, email, or password")

    session = db.create_session(user["id"], user["role"])
    return {
        "status": "success",
        "message": f"Welcome back, {user['name']}",
        "session": session
    }

@app.post("/api/auth/pin-login")
def pin_login(payload: dict = Body(...)):
    """4-digit or 6-digit Senior PIN quick login (Zero cognitive friction)."""
    pin = payload.get("pin", "").strip()
    if not pin:
        raise HTTPException(status_code=400, detail="PIN is required")

    user = db.authenticate_pin(pin)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    session = db.create_session(user["id"], user["role"])
    return {
        "status": "success",
        "message": f"Namaste {user['name']} Ji!",
        "session": session
    }

@app.post("/api/auth/pairing-login")
def pairing_login(payload: dict = Body(...)):
    """6-character Caregiver Pairing Code login (e.g. ASR-8492)."""
    code = payload.get("code", "").strip()
    if not code:
        raise HTTPException(status_code=400, detail="Pairing code is required")

    user = db.authenticate_pairing_code(code)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Caregiver Pairing Code")

    session = db.create_session(user["id"], user["role"])
    return {
        "status": "success",
        "message": f"Connected securely to patient {user.get('patient_digital_id', 'AASRA-8921-IND')}",
        "session": session
    }

@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """Validates session token and returns active user profile."""
    if not authorization:
        # Return default guest patient session if no token provided
        patient = db.get_patient()
        return {
            "authenticated": False,
            "guest": True,
            "user": {
                "id": 1,
                "name": patient.get("name", "Savitri Devi"),
                "role": "patient",
                "patient_digital_id": patient.get("digital_id", "AASRA-8921-IND"),
                "pin": "8492"
            }
        }

    session_data = db.validate_token(authorization)
    if not session_data:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please sign in again.")

    return {
        "authenticated": True,
        "guest": False,
        "user": session_data
    }

@app.post("/api/auth/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if authorization:
        db.revoke_token(authorization)
    return {"status": "logged_out"}

@app.get("/api/auth/profiles")
def get_available_profiles():
    """Returns available pre-configured test profiles for 1-tap fast switching."""
    users = db.get_all_users()
    return {"profiles": users}

# ------------------------------------------------------------------
# 1. PATIENT PROFILE & DIGITAL ID APIS
# ------------------------------------------------------------------
@app.get("/api/patient")
def get_patient():
    patient = db.get_patient()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient

@app.post("/api/patient/update")
def update_patient(payload: dict = Body(...)):
    updated = db.update_patient(payload)
    return {"status": "success", "patient": updated}

@app.post("/api/patient/digital-id/generate")
def generate_digital_id():
    import random
    new_id = f"AASRA-{random.randint(1000, 9999)}-IND"
    new_cred = f"CG-{random.randint(1000, 9999)}-AUTH"
    updated = db.update_patient({
        "digital_id": new_id,
        "caregiver_credential": new_cred
    })
    return {"digital_id": new_id, "caregiver_credential": new_cred, "patient": updated}

# ------------------------------------------------------------------
# 2. CAREGIVER MANAGEMENT APIS
# ------------------------------------------------------------------
@app.get("/api/caregivers")
def get_caregivers():
    return {"caregivers": db.get_caregivers()}

@app.post("/api/caregivers/add")
def add_caregiver(payload: dict = Body(...)):
    if not payload.get("name"):
        raise HTTPException(status_code=400, detail="Caregiver name is required")
    new_cg = db.add_caregiver(payload)
    return {"status": "success", "caregiver": new_cg}

@app.post("/api/caregivers/revoke")
def revoke_caregiver(payload: dict = Body(...)):
    cg_id = payload.get("caregiver_id")
    if not cg_id:
        raise HTTPException(status_code=400, detail="Missing caregiver_id")
    success = db.revoke_caregiver(cg_id)
    return {"status": "success" if success else "not_found", "revoked": success}

# ------------------------------------------------------------------
# 3. REMINDERS & ROUTINE SCHEDULER APIS
# ------------------------------------------------------------------
@app.get("/api/reminders")
def get_reminders():
    reminders = db.get_reminders()
    adherence = reminder_engine.calculate_adherence(reminders)
    next_due = reminder_engine.get_next_due_reminder(reminders)
    return {
        "reminders": reminders,
        "adherence": adherence,
        "next_due": next_due,
        "total_count": len(reminders)
    }

@app.post("/api/reminders/status")
def update_reminder_status(payload: dict = Body(...)):
    rem_id = payload.get("id")
    status = payload.get("status")  # taken, skipped, missed, pending
    if not rem_id or not status:
        raise HTTPException(status_code=400, detail="Missing reminder id or status")
    
    updated = db.update_reminder_status(rem_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminders = db.get_reminders()
    adherence = reminder_engine.calculate_adherence(reminders)
    return {"updated": updated, "adherence": adherence}

@app.post("/api/reminders/add")
def add_reminder(payload: dict = Body(...)):
    import uuid
    if not payload.get("id"):
        payload["id"] = f"rem-{uuid.uuid4().hex[:6]}"
    if "status" not in payload:
        payload["status"] = "pending"
    new_rem = db.add_reminder(payload)
    return {"status": "success", "reminder": new_rem}

@app.delete("/api/reminders/{rem_id}")
def delete_reminder(rem_id: str):
    success = db.delete_reminder(rem_id)
    return {"status": "deleted" if success else "not_found", "id": rem_id}

# ------------------------------------------------------------------
# 4. COGNITIVE BASELINE & ADAPTIVE GAMES APIS
# ------------------------------------------------------------------
@app.get("/api/cognitive")
def get_cognitive():
    return db.get_cognitive_data()

@app.post("/api/cognitive/session")
def record_cognitive_session(payload: dict = Body(...)):
    session_res = cognitive_engine.evaluate_session(payload, db.get_cognitive_data())
    
    payload["domain"] = session_res["evaluated_domain"]
    payload["timestamp"] = session_res["timestamp"]
    payload["id"] = f"session-{int(time.time())}"
    
    updated_cog = db.add_cognitive_session(payload)
    return {
        "evaluation": session_res,
        "cognitive_state": updated_cog
    }

@app.get("/api/cognitive/analytics")
def get_cognitive_analytics():
    cog_data = db.get_cognitive_data()
    domains = cog_data.get("domains", {})
    sessions = cog_data.get("sessions", [])
    
    recent_scores = [s.get("score", 0) for s in sessions[:10]]
    avg_recent = round(sum(recent_scores) / max(len(recent_scores), 1), 1) if recent_scores else cog_data.get("baseline_score", 75.0)

    return {
        "overall_index": avg_recent,
        "baseline_score": cog_data.get("baseline_score", 78.5),
        "domains": domains,
        "total_sessions_completed": len(sessions),
        "recent_history": sessions[:5]
    }

# ------------------------------------------------------------------
# 5. MEMORY CAPSULE APIS
# ------------------------------------------------------------------
@app.get("/api/memory-capsule")
def get_memory_capsule():
    memories = db.get_memory_capsule()
    return {"items": memories, "count": len(memories)}

@app.post("/api/memory-capsule/add")
def add_memory(payload: dict = Body(...)):
    import uuid
    if not payload.get("id"):
        payload["id"] = f"mem-{uuid.uuid4().hex[:6]}"
    new_mem = db.add_memory(payload)
    return {"status": "success", "memory": new_mem}

@app.delete("/api/memory-capsule/{mem_id}")
def delete_memory(mem_id: str):
    success = db.delete_memory(mem_id)
    return {"status": "deleted" if success else "not_found", "id": mem_id}

# ------------------------------------------------------------------
# 6. MEDICAL VAULT APIS
# ------------------------------------------------------------------
@app.get("/api/medical-vault")
def get_medical_vault():
    docs = db.get_medical_vault()
    return {"documents": docs, "count": len(docs)}

@app.post("/api/medical-vault/add")
def add_medical_doc(payload: dict = Body(...)):
    import uuid
    if not payload.get("id"):
        payload["id"] = f"doc-{uuid.uuid4().hex[:6]}"
    new_doc = db.add_medical_doc(payload)
    return {"status": "success", "document": new_doc}

# ------------------------------------------------------------------
# 7. CONSENT & CAREGIVER AUDIT APIS
# ------------------------------------------------------------------
@app.get("/api/consent")
def get_consent():
    return db.get_consent()

@app.post("/api/consent/update")
def update_consent(payload: dict = Body(...)):
    consent_dict = payload.get("consent", {})
    actor = payload.get("actor", "Patient (Savitri Devi)")
    updated = db.update_consent(consent_dict, actor=actor)
    return {"status": "success", "consent": updated}

@app.get("/api/consent/logs")
def get_consent_logs():
    consent_data = db.get_consent()
    return {"audit_logs": consent_data.get("audit_logs", [])}

# ------------------------------------------------------------------
# 8. MULTILINGUAL AI VOICE & CAREGIVER INSIGHTS APIS
# ------------------------------------------------------------------
@app.post("/api/ai/voice-intent")
def parse_voice(payload: dict = Body(...)):
    text = payload.get("text", "")
    lang = payload.get("lang", "hi")
    gen_audio = payload.get("generate_audio", False)
    intent_res = ai_service.parse_voice_intent(text, lang=lang, generate_audio=gen_audio)
    
    # Log voice interaction to SQLite for analytics
    db.log_voice_interaction(
        text=text,
        lang=lang,
        intent=intent_res.get("intent", "general_query"),
        action=intent_res.get("action", "conversational_reply"),
        response=intent_res.get("speech_response", "")
    )
    return intent_res

@app.get("/api/ai/voice-history")
def get_voice_history():
    history = db.get_voice_history()
    return {"history": history, "count": len(history)}

@app.get("/api/caregiver/insights")
def get_caregiver_insights():
    patient = db.get_patient()
    reminders = db.get_reminders()
    adherence = reminder_engine.calculate_adherence(reminders)
    cog_data = db.get_cognitive_data()
    alerts = db.get_emergency_logs()
    insights = ai_service.generate_caregiver_insights(
        adherence_data=adherence,
        cognitive_data=cog_data,
        patient_data=patient,
        alerts_data=alerts
    )
    return {
        "adherence": adherence,
        "cognitive_summary": cog_data.get("domains", {}),
        "insights": insights,
        "groq_status": groq_service.get_status()
    }

# ------------------------------------------------------------------
# 9. GROQ / GROK HIGH-SPEED AI ENGINE APIS
# ------------------------------------------------------------------
@app.get("/api/groq/status")
@app.get("/api/grok/status")
def get_groq_status():
    return groq_service.get_status()

@app.post("/api/groq/config")
@app.post("/api/grok/config")
def update_groq_config(payload: dict = Body(...)):
    key = payload.get("api_key", "")
    groq_service.set_api_key(key)
    return {"status": "updated", "configured": bool(key), "groq_status": groq_service.get_status()}

@app.post("/api/cognitive/adaptive-difficulty")
def get_adaptive_difficulty(payload: dict = Body(...)):
    """
    Computes real-time dynamic difficulty adaptation for cognitive games.
    Adjusts grid size, clue hints, distractor count, and pacing based on patient performance.
    """
    cog_state = db.get_cognitive_data()
    adaptation = groq_service.adapt_game_difficulty(payload, cog_state)
    return adaptation

@app.post("/api/cognitive/dynamic-challenge")
def get_dynamic_challenge(payload: dict = Body(...)):
    """
    Generates personalized dynamic challenges and memory questions on the fly.
    """
    game_type = payload.get("game_type", "photo_recall")
    difficulty = payload.get("difficulty", 2)
    lang = payload.get("lang", "hi")
    patient = db.get_patient()
    challenge = groq_service.generate_dynamic_challenge(
        game_type=game_type,
        difficulty=difficulty,
        lang=lang,
        patient_profile=patient
    )
    return challenge

# ------------------------------------------------------------------
# 10. SARVAM AI DEDICATED SUITE ENDPOINTS
# ------------------------------------------------------------------
@app.post("/api/sarvam/tts")
def sarvam_tts(payload: dict = Body(...)):
    text = payload.get("text", "")
    lang = payload.get("lang", "hi")
    pace = payload.get("pace", 0.88)
    if not text:
        raise HTTPException(status_code=400, detail="Missing text input for TTS")
    return sarvam_service.text_to_speech(text, lang=lang, pace=pace)

@app.post("/api/sarvam/translate")
def sarvam_translate(payload: dict = Body(...)):
    text = payload.get("text", "")
    src = payload.get("source_lang", "en")
    tgt = payload.get("target_lang", "hi")
    if not text:
        raise HTTPException(status_code=400, detail="Missing text input for translation")
    return sarvam_service.translate_text(text, source_lang=src, target_lang=tgt)

@app.post("/api/sarvam/chat")
def sarvam_chat(payload: dict = Body(...)):
    prompt = payload.get("prompt", "")
    lang = payload.get("lang", "hi")
    history = payload.get("history", [])
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing prompt input for chat")
    return sarvam_service.chat_completion(prompt, lang=lang, history=history)

@app.get("/api/sarvam/status")
def sarvam_status():
    return sarvam_service.get_status()

@app.post("/api/sarvam/config")
def sarvam_config(payload: dict = Body(...)):
    key = payload.get("api_key", "")
    sarvam_service.set_api_key(key)
    return {"status": "updated", "configured": bool(key)}

# ------------------------------------------------------------------
# 11. EMERGENCY SOS APIS
# ------------------------------------------------------------------
@app.post("/api/emergency/trigger")
def trigger_emergency(payload: dict = Body(...)):
    event = {
        "timestamp": time.time(),
        "patient": db.get_patient().get("name", "Savitri Devi"),
        "digital_id": db.get_patient().get("digital_id", "AASRA-8921-IND"),
        "location": payload.get("location", "Shillong Home - Living Room (GPS: 25.5788° N, 91.8933° E)"),
        "trigger_type": payload.get("trigger_type", "Voice / 1-Tap SOS Button"),
        "status": "ACTIVE_ALERT"
    }
    db.log_emergency(event)
    return {"status": "EMERGENCY_BROADCASTED", "event": event}

@app.get("/api/emergency/logs")
def get_emergency_logs():
    return {"emergency_alerts": db.get_emergency_logs()}

# ------------------------------------------------------------------
# 11. SYSTEM & DATABASE APIS
# ------------------------------------------------------------------
@app.get("/api/db/stats")
def get_database_stats():
    return db.get_db_stats()

@app.post("/api/db/reset")
def reset_database():
    stats = db.reset_database()
    return {"status": "reset_complete", "db_stats": stats}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
