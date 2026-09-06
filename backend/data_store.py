import os
import json
import time
from typing import Dict, Any, List, Optional
from database import db_engine

class DataStore:
    """
    DataStore interface delegating to SQLite database engine.
    Ensures seamless compatibility and atomic transactions.
    """

    def __init__(self):
        self.engine = db_engine

    def get_patient(self):
        return self.engine.get_patient()

    def update_patient(self, update_dict: dict):
        return self.engine.update_patient(update_dict)

    def get_caregivers(self):
        return self.engine.get_caregivers()

    def add_caregiver(self, cg_data: dict):
        return self.engine.add_caregiver(cg_data)

    def revoke_caregiver(self, caregiver_id: str):
        return self.engine.revoke_caregiver(caregiver_id)

    def get_reminders(self):
        return self.engine.get_reminders()

    def add_reminder(self, reminder: dict):
        return self.engine.add_reminder(reminder)

    def update_reminder_status(self, rem_id: str, status: str):
        return self.engine.update_reminder_status(rem_id, status)

    def delete_reminder(self, rem_id: str):
        return self.engine.delete_reminder(rem_id)

    def get_cognitive_data(self):
        return self.engine.get_cognitive_data()

    def add_cognitive_session(self, session: dict):
        return self.engine.add_cognitive_session(session)

    def get_memory_capsule(self):
        return self.engine.get_memory_capsules()

    def add_memory(self, item: dict):
        return self.engine.add_memory_capsule(item)

    def delete_memory(self, mem_id: str):
        return self.engine.delete_memory_capsule(mem_id)

    def get_medical_vault(self):
        return self.engine.get_medical_vault()

    def add_medical_doc(self, doc: dict):
        return self.engine.add_medical_doc(doc)

    def get_consent(self):
        return self.engine.get_consent()

    def update_consent(self, consent_dict: dict, actor: str = "Patient (Savitri Devi)"):
        return self.engine.update_consent(consent_dict, actor=actor)

    def log_emergency(self, event: dict):
        return self.engine.log_emergency(event)

    def get_emergency_logs(self):
        return self.engine.get_emergency_logs()

    def log_voice_interaction(self, text: str, lang: str, intent: str, action: str, response: str):
        return self.engine.log_voice_interaction(text, lang, intent, action, response)

    def get_voice_history(self):
        return self.engine.get_voice_history()

    def get_db_stats(self):
        return self.engine.get_db_stats()

    def reset_database(self):
        return self.engine.reset_database()

    def register_user(self, user_data: dict):
        return self.engine.register_user(user_data)

    def authenticate_user(self, identifier: str, raw_password: str):
        return self.engine.authenticate_user(identifier, raw_password)

    def authenticate_pin(self, pin: str):
        return self.engine.authenticate_pin(pin)

    def authenticate_pairing_code(self, code: str):
        return self.engine.authenticate_pairing_code(code)

    def create_session(self, user_id: int, role: str):
        return self.engine.create_session(user_id, role)

    def validate_token(self, token: str):
        return self.engine.validate_token(token)

    def revoke_token(self, token: str):
        return self.engine.revoke_token(token)

    def get_user_by_id(self, user_id: int):
        return self.engine.get_user_by_id(user_id)

    def get_all_users(self):
        return self.engine.get_all_users()

db = DataStore()

