import time
from typing import List, Dict, Any

class ReminderEngine:
    """
    Deterministic Medication & Daily Task Scheduler.
    Guarantees strict schedule execution without LLM ambiguity.
    """

    def calculate_adherence(self, reminders: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(reminders)
        if total == 0:
            return {"adherence_rate": 100.0, "taken": 0, "skipped": 0, "missed": 0, "pending": 0}

        taken = sum(1 for r in reminders if r.get("status") == "taken")
        skipped = sum(1 for r in reminders if r.get("status") == "skipped")
        missed = sum(1 for r in reminders if r.get("status") == "missed")
        pending = sum(1 for r in reminders if r.get("status") == "pending")

        completed_or_due = taken + skipped + missed
        rate = round((taken / completed_or_due * 100), 1) if completed_or_due > 0 else 100.0

        return {
            "adherence_rate": rate,
            "taken": taken,
            "skipped": skipped,
            "missed": missed,
            "pending": pending,
            "total": total
        }

    def get_next_due_reminder(self, reminders: List[Dict[str, Any]]) -> Dict[str, Any]:
        pending = [r for r in reminders if r.get("status") == "pending"]
        if pending:
            return pending[0]
        return {
            "title": "All daily tasks completed!",
            "category": "routine",
            "time": "Evening Rest",
            "audio_prompt": "You have completed all your daily medicines and activities. Rest well!"
        }

reminder_engine = ReminderEngine()
