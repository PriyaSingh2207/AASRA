import hashlib
import os
import secrets
import time
from typing import Dict, Any, Optional

TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 days

class AuthService:
    """
    Cryptographic Authentication & Role-Based Access Control for AASRA.
    Supports Patients (PIN/Digital ID), Family Caregivers, and Clinical Doctors.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """Generates PBKDF2 HMAC-SHA256 hash with cryptographic salt."""
        salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}${key.hex()}"

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Timing-attack-safe PBKDF2 verification."""
        try:
            if not password_hash or '$' not in password_hash:
                return False
            salt, stored_key = password_hash.split('$', 1)
            computed_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return secrets.compare_digest(stored_key, computed_key.hex())
        except Exception:
            return False

    @staticmethod
    def generate_token() -> str:
        """Generates high-entropy session token."""
        return f"aasra_tok_{secrets.token_urlsafe(32)}"

    @staticmethod
    def get_token_expiry() -> float:
        return time.time() + TOKEN_EXPIRY_SECONDS

auth_service = AuthService()
