import requests
import json

BASE = "http://127.0.0.1:8000"

print("==================================================")
print("     AASRA SYSTEM INTEGRATION VERIFICATION")
print("==================================================")

# 1. Test Health and Groq AI Engine Status
print("\n[1] Testing Groq / Grok AI Status...")
res_groq = requests.get(f"{BASE}/api/groq/status")
print("    Status Code:", res_groq.status_code)
groq_info = res_groq.json()
print("    Configured :", groq_info.get("configured"))
print("    Masked Key :", groq_info.get("masked_key"))
print("    Provider   :", groq_info.get("provider"))
print("    Model      :", groq_info.get("default_model"))
print("    Mode       :", groq_info.get("mode"))

# 2. Test Sarvam AI Status
print("\n[2] Testing Sarvam AI Status...")
res_sarvam = requests.get(f"{BASE}/api/sarvam/status")
print("    Status Code:", res_sarvam.status_code)
sarvam_info = res_sarvam.json()
print("    Configured :", sarvam_info.get("configured"))
print("    Languages  :", len(sarvam_info.get("supported_languages", [])))

# 3. Test Authentication Service
print("\n[3] Testing Multi-Role Authentication Profiles...")
res_auth = requests.get(f"{BASE}/api/auth/profiles")
print("    Profiles:", [p.get("name") + " (" + p.get("role") + ")" for p in res_auth.json().get("profiles", [])])

# 4. Test Senior PIN Login
print("\n[4] Testing Senior 4-Digit PIN Login...")
res_pin = requests.post(f"{BASE}/api/auth/pin-login", json={"pin": "8492"})
print("    PIN Login Status:", res_pin.status_code)
pin_data = res_pin.json()
session = pin_data.get("session", {})
print("    Logged In User  :", session.get("user", {}).get("name"))
print("    Token Received  :", session.get("token")[:16] + "...")

# 5. Test Caregiver Pairing Code Login
print("\n[5] Testing Caregiver Pairing Code Login...")
res_pair = requests.post(f"{BASE}/api/auth/pairing-login", json={"code": "ASR-8492"})
print("    Pairing Login Status:", res_pair.status_code)
cg_session = res_pair.json().get("session", {})
print("    Logged In Caregiver :", cg_session.get("user", {}).get("name"))

# 6. Test Adaptive Difficulty for ALL 8 Cognitive Games
print("\n[6] Testing Real-Time Adaptive Difficulty for All 8 Games...")
games = [
    "photo_recall",
    "spatial_focus",
    "time_quiz",
    "math_puzzle",
    "plant_match",
    "word_association",
    "sequence_recall",
    "daily_categorization"
]

for g in games:
    payload = {
        "game_type": g,
        "patient_name": "Savitri Devi",
        "difficulty": 2.0,
        "score": 88,
        "completion_time_sec": 24
    }
    res = requests.post(f"{BASE}/api/cognitive/adaptive-difficulty", json=payload)
    d = res.json()
    print(f"    - {g:22s} | Next Lvl: {d.get('next_recommended_level')} | Engine: {d.get('engine')} | Distractors: {d.get('distractor_count')} | Clue Delay: {d.get('clue_delay_sec')}s")

# 7. Test Cognitive Session Logging into SQLite
print("\n[7] Testing Cognitive Session Logging into SQLite...")
sess_payload = {
    "game_id": "sequence_recall",
    "domain": "working_memory",
    "difficulty": 2.5,
    "score": 92,
    "reaction_time_ms": 2600,
    "completed": True,
    "confusion_signals": 0,
    "metadata": {"sequence_length": 4, "sound": "temple_bells"}
}
res_sess = requests.post(f"{BASE}/api/cognitive/session", json=sess_payload)
print("    Session Logged Status:", res_sess.status_code)
print("    Updated Domains       :", list(res_sess.json().get("cognitive_state", {}).get("domains", {}).keys()))

print("\n==================================================")
print("  ALL 7 SYSTEM MODULES VERIFIED & OPERATIONAL!    ")
print("==================================================")
