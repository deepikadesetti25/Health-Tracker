import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

BASE_DIR = Path(__file__).resolve().parent.parent / "backend"
load_dotenv(BASE_DIR / ".env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded Key: {api_key[:15]}...{api_key[-10:] if api_key else ''}")

if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Listing available models:")
        for m in genai.list_models():
            print(f" - {m.name} (supports: {m.supported_generation_methods})")
            
        print("\nAttempting basic generation with gemini-1.5-flash:")
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Hello! Are you working?")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
else:
    print("No API Key found in .env!")
