import time
from typing import Dict, Any, List

class ConsentManager:
    """
    Patient-First Consent & Role-Based Access Control Manager.
    Ensures caregiver authorization is strictly consent-driven and audited.
    """

    PERMISSION_KEYS = [
        "medicine_access",
        "cognitive_metrics",
        "memory_capsule_edit",
        "location_sharing",
        "community_visibility"
    ]

    def verify_caregiver_access(self, consent_policy: Dict[str, Any], required_permission: str, actor: str) -> Dict[str, Any]:
        has_permission = consent_policy.get(required_permission, False)
        status = "GRANTED" if has_permission else "DENIED"

        audit_entry = {
            "timestamp": time.time(),
            "actor": actor,
            "required_permission": required_permission,
            "status": status,
            "reason": f"Patient consent check for {required_permission}"
        }

        return {
            "allowed": has_permission,
            "status": status,
            "audit_entry": audit_entry
        }

consent_manager = ConsentManager()
