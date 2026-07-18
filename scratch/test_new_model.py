import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

BASE_DIR = Path(__file__).resolve().parent.parent / "backend"
load_dotenv(BASE_DIR / ".env")

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Attempting generation with gemini-2.5-flash:")
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Hello! Verify if you are online and working.")
        print(f"Success! Response: {response.text.strip()}")
    except Exception as e:
        print(f"gemini-2.5-flash failed: {str(e)}")
        
    try:
        print("\nAttempting generation with gemini-2.0-flash:")
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content("Hello! Verify if you are online and working.")
        print(f"Success! Response: {response.text.strip()}")
    except Exception as e:
        print(f"gemini-2.0-flash failed: {str(e)}")
else:
    print("No key found!")
