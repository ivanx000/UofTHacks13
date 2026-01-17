import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load environment variables (API Keys)
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# 2. Setup CORS (Crucial for Next.js connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define the Request Body
class VibeRequest(BaseModel):
    vibe: str

@app.post("/recommend")
async def get_recommendations(request: VibeRequest):
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        # System instructions to ensure it returns products
        prompt = f"The user's vibe is: '{request.vibe}'. Suggest 3 specific types of products that match this vibe. Return only the list of products."
        
        response = model.generate_content(prompt)
        return {"products": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))