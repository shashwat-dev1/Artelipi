# Firebase Setup for Artelipi Recommender

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase_from_env():
    """Initialize Firebase using environment variables from .env.local or Render"""
    
    # First, try to load from FIREBASE_SERVICE_ACCOUNT_JSON (Render deployment)
    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if firebase_json:
        try:
            firebase_config = json.loads(firebase_json)
            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase initialized from JSON env var for project: {firebase_config.get('project_id')}")
            return firestore.client()
        except Exception as e:
            print(f"❌ Error initializing Firebase from JSON: {e}")
            return None
    
    # Fallback: Read Firebase config from individual environment variables
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\\\n', '\\n'),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    }
    
    # Check if we have the required fields
    if not firebase_config["project_id"]:
        print("⚠️ Firebase project_id not found in environment")
        return None
    
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
        print(f"✅ Firebase initialized for project: {firebase_config['project_id']}")
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None


def init_firebase_simple():
    """Simple Firebase initialization for development"""
    try:
        # Check if already initialized
        app = firebase_admin.get_app()
        return firestore.client(app)
    except ValueError:
        # Initialize without credentials (for development)
        # This will work if you're using Firebase emulator or have gcloud auth
        try:
            firebase_admin.initialize_app()
            return firestore.client()
        except Exception as e:
            print(f"❌ Could not initialize Firebase: {e}")
            print("\n💡 To fix this:")
            print("1. Make sure you have Firebase credentials")
            print("2. Or use Firebase emulator for development")
            return None
