import time
from typing import Dict, Any, List
from groq_service import groq_service

class CognitiveEngine:
    """
    Implements the 6-domain cognitive evaluation framework & adaptive personalization loop:
    Play -> Measure -> Analyze -> Adapt -> Recommend -> Track
    Powered by Groq / Grok High-Speed AI Engine with offline rule-based resilience.
    """
    
    COGNITIVE_DOMAINS = [
        "memory",
        "attention", 
        "recognition",
        "orientation",
        "processing",
        "problem_solving"
    ]

    GAME_TO_DOMAIN_MAP = {
        "photo_recall": "recognition",
        "spatial_focus": "attention",
        "time_quiz": "orientation",
        "math_puzzle": "problem_solving",
        "plant_match": "processing",
        "word_association": "recognition",
        "sequence_recall": "memory",
        "daily_categorization": "problem_solving"
    }

    def evaluate_session(self, session_data: Dict[str, Any], current_cognitive_state: Dict[str, Any]) -> Dict[str, Any]:
        game_type = session_data.get("game_type", "photo_recall")
        domain = self.GAME_TO_DOMAIN_MAP.get(game_type, "memory")
        raw_score = session_data.get("score", 70)
        time_taken = session_data.get("completion_time_sec", 45)
        current_level = session_data.get("difficulty", 1)

        # Call Groq/Grok dynamic difficulty adaptation
        ai_adaptation = groq_service.adapt_game_difficulty(session_data, current_cognitive_state)

        next_level = ai_adaptation.get("next_recommended_level", current_level)
        adaptation_note = ai_adaptation.get("adaptation_note", "Adaptive difficulty tuned for calming engagement.")
        adjusted_score = ai_adaptation.get("score", raw_score)

        recommendations = self.generate_recommendations(domain, adjusted_score, current_cognitive_state)

        return {
            "evaluated_domain": domain,
            "adjusted_score": adjusted_score,
            "previous_level": current_level,
            "next_recommended_level": next_level,
            "pacing_pace_factor": ai_adaptation.get("pacing_pace_factor", 0.88),
            "distractor_count": ai_adaptation.get("distractor_count", 3),
            "clue_delay_sec": ai_adaptation.get("clue_delay_sec", 15),
            "adaptation_note": adaptation_note,
            "caregiver_note": ai_adaptation.get("caregiver_note", "Session completed with positive pacing."),
            "ai_engine": ai_adaptation.get("engine", "groq_lpu_ai"),
            "recommendations": recommendations,
            "timestamp": time.time()
        }

    def generate_recommendations(self, domain: str, score: float, cognitive_state: Dict[str, Any]) -> List[str]:
        recommendations = []
        if domain == "recognition":
            recommendations.append("Play 5 minutes of Family Photo Match before afternoon tea.")
        elif domain == "attention":
            recommendations.append("Try spatial target matching in a quiet, comfortable room.")
        elif domain == "orientation":
            recommendations.append("Morning voice check-in for day, weather, and garden flower status.")
        elif domain == "problem_solving":
            recommendations.append("Simple coin counter exercise with audio feedback.")
        else:
            recommendations.append("Enjoy a relaxing audio memory story from your capsule.")

        return recommendations

cognitive_engine = CognitiveEngine()
