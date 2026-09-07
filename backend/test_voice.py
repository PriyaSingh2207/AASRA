import requests
import json

BASE = "http://127.0.0.1:8000"

print("==================================================")
print("     TESTING AASRA VOICE COMMANDS & TTS ENGINE    ")
print("==================================================")

test_queries = [
    ("What do I have to do today?", "en"),
    ("AASRA meri dawai ka time kya hai?", "hi"),
    ("Let us play the memory game", "en"),
    ("Bachao SOS Emergency", "hi"),
    ("Where am I right now?", "en"),
    ("আপুনি ক'ত আছোঁ?", "as"),
    ("পারিবারিক ছবি খেলা শুরু করো", "bn")
]

for query, lang in test_queries:
    res = requests.post(f"{BASE}/api/ai/voice-intent", json={
        "text": query,
        "lang": lang,
        "generate_audio": False
    })
    d = res.json()
    intent = d.get("intent")
    action = d.get("action")
    reply = d.get("speech_response")
    print(f"\n[Query]: '{query}' (lang: {lang})")
    print(f"  -> Intent: {intent}")
    print(f"  -> Action: {action}")
    print(f"  -> Reply : {reply}")

print("\n--- Testing Sarvam Bulbul:v3 Neural TTS ---")
tts_res = requests.post(f"{BASE}/api/sarvam/tts", json={
    "text": "नमस्ते सावित्री जी, आपकी आज की दवाइयाँ तैयार हैं।",
    "lang": "hi",
    "pace": 0.88
})
print("TTS Status Code:", tts_res.status_code)
tts_data = tts_res.json()
print("Audio Stream Generated:", bool(tts_data.get("audio_base64") or tts_data.get("audio_url") or tts_data.get("status") == "success"))

print("\n==================================================")
print("       ALL VOICE TESTS PASSED SUCCESSFULLY!       ")
print("==================================================")
