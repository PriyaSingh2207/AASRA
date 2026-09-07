import sqlite3
import os
import json
import time
from typing import Dict, Any, List, Optional
from auth_service import auth_service

DB_FILE = os.path.join(os.path.dirname(__file__), "aasra.db")
JSON_FALLBACK_FILE = os.path.join(os.path.dirname(__file__), "aasra_db.json")

class DatabaseEngine:
    """
    SQLite Database Engine for AASRA.
    Manages 11 relational tables, thread-safe connections, seed migration, and CRUD methods.
    """

    def __init__(self, db_file: str = DB_FILE):
        self.db_file = db_file
        self.init_schema()
        self.seed_if_empty()

    def get_connection(self):
        conn = sqlite3.connect(self.db_file, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_schema(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Patients Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                digital_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER,
                language TEXT DEFAULT 'hi',
                voice_enabled INTEGER DEFAULT 1,
                voice_speed REAL DEFAULT 0.9,
                high_contrast INTEGER DEFAULT 0,
                large_text INTEGER DEFAULT 1,
                caregiver_credential TEXT,
                emergency_contacts TEXT,
                created_at REAL
            )
            """)

            # 2. Caregivers Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS caregivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                caregiver_id TEXT UNIQUE,
                digital_id TEXT,
                name TEXT NOT NULL,
                relation TEXT,
                email TEXT,
                phone TEXT,
                status TEXT DEFAULT 'connected',
                connected_at REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 3. Reminders Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id TEXT PRIMARY KEY,
                digital_id TEXT,
                title TEXT NOT NULL,
                category TEXT DEFAULT 'medicine',
                time TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                dosage TEXT,
                prescribed_by TEXT,
                audio_prompt TEXT,
                created_at REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 4. Cognitive Sessions Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cognitive_sessions (
                id TEXT PRIMARY KEY,
                digital_id TEXT,
                game_type TEXT NOT NULL,
                score REAL,
                domain TEXT,
                difficulty INTEGER,
                completion_time_sec INTEGER,
                timestamp REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 5. Cognitive Domains Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cognitive_domains (
                digital_id TEXT,
                domain_key TEXT,
                score REAL DEFAULT 75.0,
                trend TEXT DEFAULT '0%',
                level INTEGER DEFAULT 1,
                PRIMARY KEY (digital_id, domain_key),
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 6. Memory Capsules Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_capsules (
                id TEXT PRIMARY KEY,
                digital_id TEXT,
                title TEXT NOT NULL,
                relationship TEXT,
                context TEXT,
                year TEXT,
                audio_story TEXT,
                image_url TEXT,
                created_at REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 7. Medical Vault Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS medical_vault (
                id TEXT PRIMARY KEY,
                digital_id TEXT,
                title TEXT NOT NULL,
                doctor TEXT,
                hospital TEXT,
                date TEXT,
                notes TEXT,
                type TEXT DEFAULT 'Prescription',
                created_at REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 8. Consent Preferences Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS consent_preferences (
                digital_id TEXT PRIMARY KEY,
                medicine_access INTEGER DEFAULT 1,
                cognitive_metrics INTEGER DEFAULT 1,
                memory_capsule_edit INTEGER DEFAULT 1,
                location_sharing INTEGER DEFAULT 1,
                community_visibility INTEGER DEFAULT 0,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 9. Consent Audit Logs Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS consent_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                digital_id TEXT,
                timestamp REAL,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                status TEXT DEFAULT 'APPROVED',
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 10. Emergency Alerts Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS emergency_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                digital_id TEXT,
                patient_name TEXT,
                location TEXT,
                trigger_type TEXT,
                status TEXT DEFAULT 'ACTIVE_ALERT',
                timestamp REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 11. Voice Interactions Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS voice_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                digital_id TEXT,
                user_text TEXT NOT NULL,
                lang TEXT DEFAULT 'hi',
                detected_intent TEXT,
                action TEXT,
                speech_response TEXT,
                timestamp REAL,
                FOREIGN KEY (digital_id) REFERENCES patients(digital_id)
            )
            """)

            # 12. Real Users Table (Patients, Caregivers, Doctors)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT,
                role TEXT NOT NULL DEFAULT 'caregiver',
                name TEXT NOT NULL,
                phone TEXT,
                pin TEXT,
                patient_digital_id TEXT DEFAULT 'AASRA-8921-IND',
                pairing_code TEXT DEFAULT 'ASR-8492',
                created_at REAL,
                last_login REAL
            )
            """)

            # 13. Auth Tokens Table (Active Sessions)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                expires_at REAL,
                created_at REAL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """)

            conn.commit()

    def seed_if_empty(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM patients")
            if cursor.fetchone()[0] > 0:
                return

            initial_data = {}
            if os.path.exists(JSON_FALLBACK_FILE):
                try:
                    with open(JSON_FALLBACK_FILE, "r", encoding="utf-8") as f:
                        initial_data = json.load(f)
                except Exception:
                    initial_data = {}

            p = initial_data.get("patient", {
                "digital_id": "AASRA-8921-IND",
                "name": "Savitri Devi",
                "age": 74,
                "language": "hi",
                "voice_enabled": True,
                "voice_speed": 0.9,
                "high_contrast": False,
                "large_text": True,
                "caregiver_credential": "CG-9942-AUTH",
                "emergency_contacts": [
                    {"name": "Rahul Sharma (Son)", "phone": "+91 98765 43210", "role": "Primary Caregiver"},
                    {"name": "Dr. Ananya Baruah", "phone": "+91 94350 12345", "role": "Neurologist"}
                ],
                "created_at": time.time()
            })

            patient_id = p.get("digital_id", "AASRA-8921-IND")

            cursor.execute("""
            INSERT INTO patients (digital_id, name, age, language, voice_enabled, voice_speed, high_contrast, large_text, caregiver_credential, emergency_contacts, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                patient_id,
                p.get("name", "Savitri Devi"),
                p.get("age", 74),
                p.get("language", "hi"),
                1 if p.get("voice_enabled", True) else 0,
                p.get("voice_speed", 0.9),
                1 if p.get("high_contrast", False) else 0,
                1 if p.get("large_text", True) else 0,
                p.get("caregiver_credential", "CG-9942-AUTH"),
                json.dumps(p.get("emergency_contacts", [])),
                p.get("created_at", time.time())
            ))

            caregivers = initial_data.get("caregivers", [
                {
                    "caregiver_id": "CG-9942-AUTH",
                    "name": "Rahul Sharma",
                    "relation": "Son & Primary Caregiver",
                    "email": "rahul.sharma@example.com",
                    "phone": "+91 98765 43210",
                    "status": "connected",
                    "connected_at": time.time() - 86400 * 30
                }
            ])
            for cg in caregivers:
                cursor.execute("""
                INSERT INTO caregivers (caregiver_id, digital_id, name, relation, email, phone, status, connected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    cg.get("caregiver_id", f"CG-{int(time.time())}"),
                    patient_id,
                    cg.get("name"),
                    cg.get("relation"),
                    cg.get("email"),
                    cg.get("phone"),
                    cg.get("status", "connected"),
                    cg.get("connected_at", time.time())
                ))

            consent = initial_data.get("consent", {
                "medicine_access": True,
                "cognitive_metrics": True,
                "memory_capsule_edit": True,
                "location_sharing": True,
                "community_visibility": False
            })
            cursor.execute("""
            INSERT INTO consent_preferences (digital_id, medicine_access, cognitive_metrics, memory_capsule_edit, location_sharing, community_visibility)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                patient_id,
                1 if consent.get("medicine_access", True) else 0,
                1 if consent.get("cognitive_metrics", True) else 0,
                1 if consent.get("memory_capsule_edit", True) else 0,
                1 if consent.get("location_sharing", True) else 0,
                1 if consent.get("community_visibility", False) else 0
            ))

            audit_logs = consent.get("audit_logs", [
                {"timestamp": time.time() - 86400, "actor": "Rahul Sharma (Caregiver)", "action": "Viewed medication adherence report", "status": "APPROVED"},
                {"timestamp": time.time() - 43200, "actor": "Rahul Sharma (Caregiver)", "action": "Added evening BP check reminder", "status": "APPROVED"},
                {"timestamp": time.time() - 3600, "actor": "System AI Engine", "action": "Generated weekly cognitive trend insight", "status": "APPROVED"}
            ])
            for log in audit_logs:
                cursor.execute("""
                INSERT INTO consent_audit_logs (digital_id, timestamp, actor, action, status)
                VALUES (?, ?, ?, ?, ?)
                """, (patient_id, log.get("timestamp", time.time()), log.get("actor"), log.get("action"), log.get("status", "APPROVED")))

            reminders = initial_data.get("reminders", [
                {
                    "id": "rem-1",
                    "title": "Morning Memory Pill (Donepezil 5mg)",
                    "category": "medicine",
                    "time": "08:00 AM",
                    "status": "taken",
                    "dosage": "1 tablet after breakfast",
                    "prescribed_by": "Dr. Ananya Baruah",
                    "audio_prompt": "Savitri ji, please take your morning memory tablet Donepezil with water."
                },
                {
                    "id": "rem-2",
                    "title": "Morning Hydration & Water",
                    "category": "hydration",
                    "time": "10:30 AM",
                    "status": "taken",
                    "dosage": "1 full glass",
                    "prescribed_by": "Routine Care Plan",
                    "audio_prompt": "Time for a glass of fresh water to stay hydrated."
                },
                {
                    "id": "rem-3",
                    "title": "Afternoon BP Tablet (Amlodipine 5mg)",
                    "category": "medicine",
                    "time": "02:00 PM",
                    "status": "pending",
                    "dosage": "1 tablet after lunch",
                    "prescribed_by": "Dr. Ananya Baruah",
                    "audio_prompt": "It is 2 PM. Please take your afternoon blood pressure tablet."
                },
                {
                    "id": "rem-4",
                    "title": "Daily Cognitive Exercise - Family Recall",
                    "category": "cognitive",
                    "time": "04:30 PM",
                    "status": "pending",
                    "dosage": "10 minute photo match session",
                    "prescribed_by": "AASRA Cognitive Plan",
                    "audio_prompt": "Let us play today's fun family photo memory game!"
                },
                {
                    "id": "rem-5",
                    "title": "Evening Walk & Breathing",
                    "category": "routine",
                    "time": "06:00 PM",
                    "status": "pending",
                    "dosage": "15 minutes in garden",
                    "prescribed_by": "Routine Care Plan",
                    "audio_prompt": "Time for a peaceful 15-minute evening walk."
                }
            ])
            for r in reminders:
                cursor.execute("""
                INSERT INTO reminders (id, digital_id, title, category, time, status, dosage, prescribed_by, audio_prompt, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("id"),
                    patient_id,
                    r.get("title"),
                    r.get("category", "medicine"),
                    r.get("time"),
                    r.get("status", "pending"),
                    r.get("dosage"),
                    r.get("prescribed_by"),
                    r.get("audio_prompt"),
                    time.time()
                ))

            cog = initial_data.get("cognitive", {
                "baseline_score": 78.5,
                "domains": {
                    "memory": {"score": 82, "trend": "+4%", "level": 2},
                    "attention": {"score": 74, "trend": "+2%", "level": 2},
                    "recognition": {"score": 88, "trend": "+6%", "level": 3},
                    "orientation": {"score": 70, "trend": "-1%", "level": 1},
                    "processing": {"score": 76, "trend": "+3%", "level": 2},
                    "problem_solving": {"score": 72, "trend": "+1%", "level": 2}
                },
                "sessions": []
            })
            domains = cog.get("domains", {})
            for dom_key, dinfo in domains.items():
                cursor.execute("""
                INSERT INTO cognitive_domains (digital_id, domain_key, score, trend, level)
                VALUES (?, ?, ?, ?, ?)
                """, (patient_id, dom_key, dinfo.get("score", 75.0), dinfo.get("trend", "0%"), dinfo.get("level", 1)))

            sessions = cog.get("sessions", [
                {"id": "session-101", "game_type": "photo_recall", "score": 90, "domain": "recognition", "difficulty": 2, "completion_time_sec": 42, "timestamp": time.time() - 86400 * 2},
                {"id": "session-102", "game_type": "spatial_focus", "score": 75, "domain": "attention", "difficulty": 2, "completion_time_sec": 55, "timestamp": time.time() - 86400}
            ])
            for s in sessions:
                cursor.execute("""
                INSERT INTO cognitive_sessions (id, digital_id, game_type, score, domain, difficulty, completion_time_sec, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (s.get("id"), patient_id, s.get("game_type"), s.get("score"), s.get("domain"), s.get("difficulty", 1), s.get("completion_time_sec", 60), s.get("timestamp", time.time())))

            memories = initial_data.get("memory_capsule", [
                {
                    "id": "mem-1",
                    "title": "Son Rahul & Family in Guwahati",
                    "relationship": "Son & Daughter-in-law",
                    "context": "Family gathering at Kamakhya temple visit in Assam",
                    "year": "2023",
                    "audio_story": "Rahul and Priya brought fresh marigold flowers. We had traditional tea together.",
                    "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "id": "mem-2",
                    "title": "Granddaughter Meera's School Graduation",
                    "relationship": "Granddaughter",
                    "context": "Meera won first prize in classical dance competition",
                    "year": "2024",
                    "audio_story": "Meera wore a red silk saree and performed Bihu dance beautifully.",
                    "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "id": "mem-3",
                    "title": "Family Home Garden in Shillong",
                    "relationship": "Familiar Place",
                    "context": "Our ancestral garden where pine trees and orchids bloom",
                    "year": "2022",
                    "audio_story": "You love sitting in the morning sun listening to hill birds.",
                    "image_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80"
                }
            ])
            for m in memories:
                cursor.execute("""
                INSERT INTO memory_capsules (id, digital_id, title, relationship, context, year, audio_story, image_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (m.get("id"), patient_id, m.get("title"), m.get("relationship"), m.get("context"), m.get("year"), m.get("audio_story"), m.get("image_url"), time.time()))

            docs = initial_data.get("medical_vault", [
                {
                    "id": "doc-1",
                    "title": "Neurology Consultation & Prescription",
                    "doctor": "Dr. Ananya Baruah (MD Neurology)",
                    "hospital": "Guwahati Neurological Institute",
                    "date": "2026-08-15",
                    "notes": "Patient showing stable cognitive maintenance. Continue Donepezil 5mg once daily.",
                    "type": "Prescription"
                },
                {
                    "id": "doc-2",
                    "title": "Annual Blood Panel & Vit D3 Report",
                    "doctor": "Dr. R. K. Medhi Labs",
                    "hospital": "Northeast Diagnostics",
                    "date": "2026-07-10",
                    "notes": "Vitamin D3 slightly low. Prescribed weekly oral drops.",
                    "type": "Lab Report"
                }
            ])
            for d in docs:
                cursor.execute("""
                INSERT INTO medical_vault (id, digital_id, title, doctor, hospital, date, notes, type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (d.get("id"), patient_id, d.get("title"), d.get("doctor"), d.get("hospital"), d.get("date"), d.get("notes"), d.get("type", "Prescription"), time.time()))

            conn.commit()

        # Seed default users if users table is empty
        self.seed_default_users()

    def seed_default_users(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            if cursor.fetchone()[0] == 0:
                default_users = [
                    {
                        "username": "savitri",
                        "email": "savitri@aasra.local",
                        "password_hash": auth_service.hash_password("Savitri@123"),
                        "role": "patient",
                        "name": "Savitri Devi",
                        "phone": "+91 98640 12345",
                        "pin": "8492",
                        "patient_digital_id": "AASRA-8921-IND",
                        "pairing_code": "ASR-8492",
                        "created_at": time.time()
                    },
                    {
                        "username": "rahul",
                        "email": "rahul@aasra.care",
                        "password_hash": auth_service.hash_password("Caregiver@123"),
                        "role": "primary_caregiver",
                        "name": "Rahul Sharma",
                        "phone": "+91 98640 12345",
                        "pin": "8492",
                        "patient_digital_id": "AASRA-8921-IND",
                        "pairing_code": "ASR-8492",
                        "created_at": time.time()
                    },
                    {
                        "username": "drbarua",
                        "email": "dr.barua@shillongneuro.org",
                        "password_hash": auth_service.hash_password("Doctor@123"),
                        "role": "doctor",
                        "name": "Dr. Sunita Barua",
                        "phone": "+91 98620 44122",
                        "pin": "8492",
                        "patient_digital_id": "AASRA-8921-IND",
                        "pairing_code": "ASR-8492",
                        "created_at": time.time()
                    }
                ]
                for u in default_users:
                    cursor.execute("""
                    INSERT INTO users (username, email, password_hash, role, name, phone, pin, patient_digital_id, pairing_code, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (u["username"], u["email"], u["password_hash"], u["role"], u["name"], u["phone"], u["pin"], u["patient_digital_id"], u["pairing_code"], u["created_at"]))
                conn.commit()

    def get_patient(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT * FROM patients LIMIT 1").fetchone()
            if not row:
                return {}
            d = dict(row)
            d["voice_enabled"] = bool(d["voice_enabled"])
            d["high_contrast"] = bool(d["high_contrast"])
            d["large_text"] = bool(d["large_text"])
            if d.get("emergency_contacts"):
                try:
                    d["emergency_contacts"] = json.loads(d["emergency_contacts"])
                except Exception:
                    d["emergency_contacts"] = []
            return d

    def update_patient(self, update_dict: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_patient()
        if not current:
            return {}
        patient_id = current["digital_id"]

        allowed_keys = ["name", "age", "language", "voice_enabled", "voice_speed", "high_contrast", "large_text", "caregiver_credential", "emergency_contacts", "digital_id"]
        updates = []
        params = []
        for k, v in update_dict.items():
            if k in allowed_keys:
                if k in ["voice_enabled", "high_contrast", "large_text"]:
                    v = 1 if v else 0
                elif k == "emergency_contacts" and isinstance(v, list):
                    v = json.dumps(v)
                updates.append(f"{k} = ?")
                params.append(v)

        if updates:
            params.append(patient_id)
            with self.get_connection() as conn:
                conn.execute(f"UPDATE patients SET {', '.join(updates)} WHERE digital_id = ?", params)
                conn.commit()

        return self.get_patient()

    def get_caregivers(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM caregivers ORDER BY connected_at DESC").fetchall()
            return [dict(r) for r in rows]

    def add_caregiver(self, cg_data: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO caregivers (caregiver_id, digital_id, name, relation, email, phone, status, connected_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cg_data.get("caregiver_id", f"CG-{int(time.time())}"),
                digital_id,
                cg_data.get("name"),
                cg_data.get("relation"),
                cg_data.get("email"),
                cg_data.get("phone"),
                cg_data.get("status", "connected"),
                time.time()
            ))
            conn.commit()
        return cg_data

    def revoke_caregiver(self, caregiver_id: str) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM caregivers WHERE caregiver_id = ?", (caregiver_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_reminders(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM reminders ORDER BY time ASC").fetchall()
            return [dict(r) for r in rows]

    def add_reminder(self, r: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO reminders (id, digital_id, title, category, time, status, dosage, prescribed_by, audio_prompt, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r.get("id"),
                digital_id,
                r.get("title"),
                r.get("category", "medicine"),
                r.get("time"),
                r.get("status", "pending"),
                r.get("dosage"),
                r.get("prescribed_by"),
                r.get("audio_prompt"),
                time.time()
            ))
            conn.commit()
        return r

    def update_reminder_status(self, rem_id: str, status: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE reminders SET status = ? WHERE id = ?", (status, rem_id))
            conn.commit()
            if cursor.rowcount > 0:
                row = conn.execute("SELECT * FROM reminders WHERE id = ?", (rem_id,)).fetchone()
                return dict(row) if row else None
            return None

    def delete_reminder(self, rem_id: str) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_cognitive_data(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            dom_rows = conn.execute("SELECT domain_key, score, trend, level FROM cognitive_domains").fetchall()
            domains = {r["domain_key"]: {"score": r["score"], "trend": r["trend"], "level": r["level"]} for r in dom_rows}

            sess_rows = conn.execute("SELECT * FROM cognitive_sessions ORDER BY timestamp DESC LIMIT 20").fetchall()
            sessions = [dict(s) for s in sess_rows]

            avg_score = round(sum(r["score"] for r in dom_rows) / max(len(dom_rows), 1), 1) if dom_rows else 75.0

            return {
                "baseline_completed": True,
                "baseline_score": avg_score,
                "domains": domains,
                "sessions": sessions
            }

    def add_cognitive_session(self, session: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        domain = session.get("domain", "memory")
        score = float(session.get("score", 75.0))
        game_type = session.get("game_type") or session.get("game_id") or "cognitive_exercise"
        completion_time = session.get("completion_time_sec")
        if completion_time is None:
            completion_time = round(session.get("reaction_time_ms", 30000) / 1000.0, 1)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO cognitive_sessions (id, digital_id, game_type, score, domain, difficulty, completion_time_sec, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session.get("id", f"session-{int(time.time())}"),
                digital_id,
                game_type,
                score,
                domain,
                session.get("difficulty", 1),
                completion_time,
                session.get("timestamp", time.time())
            ))

            row = conn.execute("SELECT score, level FROM cognitive_domains WHERE domain_key = ?", (domain,)).fetchone()
            if row:
                old_score = row["score"]
                new_score = round(old_score * 0.7 + score * 0.3, 1)
                new_level = row["level"]
                if score > 85:
                    new_level = min(3, new_level + 1)
                elif score < 60:
                    new_level = max(1, new_level - 1)

                conn.execute("UPDATE cognitive_domains SET score = ?, level = ? WHERE domain_key = ?", (new_score, new_level, domain))

            conn.commit()

        return self.get_cognitive_data()

    def get_memory_capsules(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM memory_capsules ORDER BY created_at DESC").fetchall()
            return [dict(r) for r in rows]

    def add_memory_capsule(self, mem: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO memory_capsules (id, digital_id, title, relationship, context, year, audio_story, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mem.get("id"),
                digital_id,
                mem.get("title"),
                mem.get("relationship"),
                mem.get("context"),
                mem.get("year"),
                mem.get("audio_story"),
                mem.get("image_url"),
                time.time()
            ))
            conn.commit()
        return mem

    def delete_memory_capsule(self, mem_id: str) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM memory_capsules WHERE id = ?", (mem_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_medical_vault(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM medical_vault ORDER BY created_at DESC").fetchall()
            return [dict(r) for r in rows]

    def add_medical_doc(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO medical_vault (id, digital_id, title, doctor, hospital, date, notes, type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                doc.get("id"),
                digital_id,
                doc.get("title"),
                doc.get("doctor"),
                doc.get("hospital"),
                doc.get("date"),
                doc.get("notes"),
                doc.get("type", "Prescription"),
                time.time()
            ))
            conn.commit()
        return doc

    def get_consent(self) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            p_row = conn.execute("SELECT * FROM consent_preferences WHERE digital_id = ?", (digital_id,)).fetchone()
            pref = dict(p_row) if p_row else {}

            log_rows = conn.execute("SELECT timestamp, actor, action, status FROM consent_audit_logs ORDER BY timestamp DESC LIMIT 20").fetchall()
            logs = [dict(l) for l in log_rows]

            return {
                "medicine_access": bool(pref.get("medicine_access", True)),
                "cognitive_metrics": bool(pref.get("cognitive_metrics", True)),
                "memory_capsule_edit": bool(pref.get("memory_capsule_edit", True)),
                "location_sharing": bool(pref.get("location_sharing", True)),
                "community_visibility": bool(pref.get("community_visibility", False)),
                "audit_logs": logs
            }

    def update_consent(self, consent_dict: Dict[str, Any], actor: str = "Patient (Savitri Devi)") -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")

        allowed_keys = ["medicine_access", "cognitive_metrics", "memory_capsule_edit", "location_sharing", "community_visibility"]
        updates = []
        params = []
        for k, v in consent_dict.items():
            if k in allowed_keys:
                updates.append(f"{k} = ?")
                params.append(1 if v else 0)

        with self.get_connection() as conn:
            if updates:
                params.append(digital_id)
                conn.execute(f"UPDATE consent_preferences SET {', '.join(updates)} WHERE digital_id = ?", params)

            conn.execute("""
            INSERT INTO consent_audit_logs (digital_id, timestamp, actor, action, status)
            VALUES (?, ?, ?, ?, ?)
            """, (digital_id, time.time(), actor, f"Updated consent toggles: {consent_dict}", "APPROVED"))
            conn.commit()

        return self.get_consent()

    def log_emergency(self, event: Dict[str, Any]) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO emergency_alerts (digital_id, patient_name, location, trigger_type, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                digital_id,
                event.get("patient", patient.get("name", "Savitri Devi")),
                event.get("location", "Shillong Home - Living Room"),
                event.get("trigger_type", "Voice / 1-Tap SOS Button"),
                event.get("status", "ACTIVE_ALERT"),
                event.get("timestamp", time.time())
            ))
            conn.commit()
        return event

    def get_emergency_logs(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM emergency_alerts ORDER BY timestamp DESC").fetchall()
            return [dict(r) for r in rows]

    def log_voice_interaction(self, text: str, lang: str, intent: str, action: str, response: str) -> Dict[str, Any]:
        patient = self.get_patient()
        digital_id = patient.get("digital_id", "AASRA-8921-IND")
        record = {
            "digital_id": digital_id,
            "user_text": text,
            "lang": lang,
            "detected_intent": intent,
            "action": action,
            "speech_response": response,
            "timestamp": time.time()
        }
        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO voice_interactions (digital_id, user_text, lang, detected_intent, action, speech_response, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (digital_id, text, lang, intent, action, response, record["timestamp"]))
            conn.commit()
        return record

    def get_voice_history(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM voice_interactions ORDER BY timestamp DESC LIMIT 30").fetchall()
            return [dict(r) for r in rows]

    def get_db_stats(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            tables = ["patients", "caregivers", "reminders", "cognitive_sessions", "cognitive_domains", "memory_capsules", "medical_vault", "consent_audit_logs", "emergency_alerts", "voice_interactions"]
            counts = {}
            for t in tables:
                counts[t] = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]

            size_bytes = os.path.getsize(self.db_file) if os.path.exists(self.db_file) else 0

            return {
                "db_file": self.db_file,
                "size_kb": round(size_bytes / 1024, 2),
                "table_counts": counts
            }

    def reset_database(self):
        if os.path.exists(self.db_file):
            os.remove(self.db_file)
        self.init_schema()
        self.seed_if_empty()
        return self.get_db_stats()

    # ------------------------------------------------------------------
    # AUTHENTICATION & USER MANAGEMENT METHODS
    # ------------------------------------------------------------------
    def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        username = user_data.get("username", "").strip().lower()
        email = user_data.get("email", "").strip().lower()
        raw_password = user_data.get("password", "")
        role = user_data.get("role", "caregiver")
        name = user_data.get("name", username)
        phone = user_data.get("phone", "")
        pin = user_data.get("pin", "8492")
        patient_digital_id = user_data.get("patient_digital_id", "AASRA-8921-IND")
        pairing_code = user_data.get("pairing_code", "ASR-8492")

        if not raw_password and not pin:
            raise ValueError("Password or PIN is required for account creation")

        password_hash = auth_service.hash_password(raw_password) if raw_password else ""

        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Check unique username / email
            if username:
                existing = cursor.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
                if existing:
                    raise ValueError(f"Username '{username}' is already taken")
            if email:
                existing = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
                if existing:
                    raise ValueError(f"Email '{email}' is already registered")

            cursor.execute("""
            INSERT INTO users (username, email, password_hash, role, name, phone, pin, patient_digital_id, pairing_code, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, email, password_hash, role, name, phone, pin, patient_digital_id, pairing_code, time.time(), time.time()))
            conn.commit()
            user_id = cursor.lastrowid

            # Also mirror into caregivers table if role is caregiver
            if role in ["caregiver", "primary_caregiver", "doctor"]:
                cursor.execute("""
                INSERT INTO caregivers (caregiver_id, digital_id, name, relation, email, phone, status, connected_at)
                VALUES (?, ?, ?, ?, ?, ?, 'connected', ?)
                """, (f"cg-{user_id}", patient_digital_id, name, "Family Member" if role != "doctor" else "Doctor", email, phone, time.time()))
                conn.commit()

            return self.get_user_by_id(user_id)

    def authenticate_user(self, identifier: str, raw_password: str) -> Optional[Dict[str, Any]]:
        ident = identifier.strip().lower()
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?",
                (ident, ident)
            ).fetchone()
            if not row:
                return None
            
            user = dict(row)
            if not auth_service.verify_password(raw_password, user.get("password_hash", "")):
                return None

            conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (time.time(), user["id"]))
            conn.commit()

            user.pop("password_hash", None)
            return user

    def authenticate_pin(self, pin: str) -> Optional[Dict[str, Any]]:
        pin_clean = str(pin).strip()
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE pin = ? ORDER BY CASE WHEN role = 'patient' THEN 1 ELSE 2 END LIMIT 1",
                (pin_clean,)
            ).fetchone()
            if not row:
                return None
            
            user = dict(row)
            conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (time.time(), user["id"]))
            conn.commit()
            user.pop("password_hash", None)
            return user

    def authenticate_pairing_code(self, code: str) -> Optional[Dict[str, Any]]:
        clean_code = str(code).strip().upper().replace(" ", "")
        with self.get_connection() as conn:
            row = conn.execute(
                """SELECT * FROM users
                   WHERE (UPPER(pairing_code) = ? OR UPPER(patient_digital_id) = ?)
                     AND role IN ('primary_caregiver', 'caregiver')
                   ORDER BY CASE role WHEN 'primary_caregiver' THEN 0 ELSE 1 END
                   LIMIT 1""",
                (clean_code, clean_code)
            ).fetchone()
            if not row:
                return None
            
            user = dict(row)
            conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (time.time(), user["id"]))
            conn.commit()
            user.pop("password_hash", None)
            return user

    def create_session(self, user_id: int, role: str) -> Dict[str, Any]:
        token = auth_service.generate_token()
        expires_at = auth_service.get_token_expiry()
        created_at = time.time()

        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO auth_tokens (token, user_id, role, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            """, (token, user_id, role, expires_at, created_at))
            conn.commit()

        user = self.get_user_by_id(user_id)
        return {
            "token": token,
            "expires_at": expires_at,
            "user": user
        }

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        if not token:
            return None
        clean_token = token.replace("Bearer ", "").strip()
        now = time.time()
        with self.get_connection() as conn:
            row = conn.execute("""
            SELECT t.token, t.role, t.expires_at, u.id, u.username, u.email, u.name, u.role as user_role, u.patient_digital_id, u.pin, u.phone
            FROM auth_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.token = ? AND t.expires_at > ?
            """, (clean_token, now)).fetchone()

            if not row:
                return None
            return dict(row)

    def revoke_token(self, token: str) -> bool:
        clean_token = token.replace("Bearer ", "").strip()
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM auth_tokens WHERE token = ?", (clean_token,))
            conn.commit()
            return cursor.rowcount > 0

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT id, username, email, role, name, phone, pin, patient_digital_id, pairing_code, created_at, last_login FROM users WHERE id = ?", (user_id,)).fetchone()
            return dict(row) if row else None

    def get_all_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT id, username, email, role, name, phone, pin, patient_digital_id, pairing_code, created_at, last_login FROM users ORDER BY id ASC").fetchall()
            return [dict(r) for r in rows]

db_engine = DatabaseEngine()
