import os
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
from google.generativeai.types import content_types
from pinecone import Pinecone
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional

# --- 1. Configuration ---
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "vaccine-index-gemini")

if not GOOGLE_API_KEY or not PINECONE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY or PINECONE_API_KEY.")

# Initialize Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

app = FastAPI(title="Vaccine RAG Chatbot API (Gemini)")

# --- 2. Data Models ---
class VaccineStoreRequest(BaseModel):
    vaccine_name: str = Field(..., example="BCG")
    full_name: Optional[str] = Field(None, example="Bacille Calmette-Guérin")
    category: str = Field(..., example="Government EPI (Mandatory)")
    details: str = Field(..., example="BCG protects against tuberculosis...")
    preservation_guidelines: str = Field(..., example="Store between +2°C and +8°C...")

# Simplified message model for input history
class HistoryMessage(BaseModel):
    role: str = Field(..., pattern="^(user|model)$") # Gemini uses 'model', not 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., example="How do I store BCG?")
    history: List[HistoryMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    history: List[HistoryMessage]

# --- 3. Helper Functions ---

def get_gemini_embedding(text: str) -> List[float]:
    """Generates 768-dimension vector using Gemini."""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="RETRIEVAL_DOCUMENT"
    )
    return result['embedding']

def query_pinecone(query_text: str, top_k: int = 3) -> str:
    """Encodes query and searches Pinecone."""
    # 1. Embed query (specify task_type for better retrieval results)
    query_vector = genai.embed_content(
        model="models/text-embedding-004",
        content=query_text,
        task_type="RETRIEVAL_QUERY"
    )['embedding']

    # 2. Search
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )

    # 3. Format
    if not results['matches']:
        return "No relevant vaccine information found in the database."

    formatted_hits = []
    for match in results['matches']:
        md = match['metadata']
        formatted_hits.append(
             f"SOURCE (Vaccine: {md.get('vaccine_name')}, Topic: {md.get('topic')}):\n{md.get('text')}"
        )
    return "\n\n---\n\n".join(formatted_hits)

# --- 4. Gemini Tool Definition ---
# We define the tool as a Python function, Gemini SDK handles the rest beautifully.
def search_vaccine_database(query: str) -> str:
    """
    Query the Bangladesh vaccine database for factual details.
    Use this tool WHENEVER the user asks about vaccine names, storage, schedules, or side effects.
    Args:
        query: The specific search query, e.g., 'BCG storage temperature'
    """
    # This is a wrapper to make it easy for Gemini to call
    return query_pinecone(query)

# Define the tool list for the model
gemini_tools = [search_vaccine_database]

# --- 5. API Endpoints ---

@app.post("/store-vaccine")
async def store_vaccine_data(data: VaccineStoreRequest):
    """Stores vaccine data using Gemini Embeddings (768 dim)."""
    try:
        records = []
        
        # Chunk 1: Details
        details_text = f"{data.vaccine_name} Details: {data.details}"
        records.append({
            "id": f"{data.vaccine_name.lower()}_details",
            "values": get_gemini_embedding(details_text),
            "metadata": {
                 "vaccine_name": data.vaccine_name, "full_name": data.full_name or "",
                 "category": data.category, "topic": "Details", "text": data.details
            }
        })

        # Chunk 2: Preservation
        pres_text = f"{data.vaccine_name} Preservation: {data.preservation_guidelines}"
        records.append({
            "id": f"{data.vaccine_name.lower()}_preservation",
            "values": get_gemini_embedding(pres_text),
            "metadata": {
                "vaccine_name": data.vaccine_name, "full_name": data.full_name or "",
                "category": data.category, "topic": "Preservation", "text": data.preservation_guidelines
            }
        })

        index.upsert(vectors=records)
        return {"status": "success", "stored_ids": [r["id"] for r in records]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        # 1. Initialize Model (Same as before)
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash', # Ensure you use a valid model name
            tools=gemini_tools,
            system_instruction="You are a helpful assistant for Bangladesh vaccination. Use the 'search_vaccine_database' tool for factual vaccine info. If you dont fine info in this database, answer from your own knowledge. But dont tell the user that you didn't find the information in the database. Make sure your response is nicely formatted. If the user ask something like what was my previous prompt or conversation you reply your past conversation was about vaccines. Also add something more if necessary."
        )

        # 2. Reconstruct History for Gemini
        # We prefer the last few messages for context window efficiency, 
        # but you might want to increase this number (e.g., last 10 or 20)
        gemini_history = []
        for msg in req.history[-3:]:
             gemini_history.append(content_types.to_content({"role": msg.role, "parts": [msg.content]}))

        chat = model.start_chat(history=gemini_history)

        # 3. Send Message & Handle Tool Loop (Same as before)
        response = chat.send_message(req.message)

        while response.parts and any(part.function_call for part in response.parts):
            for part in response.parts:
                if fn := part.function_call:
                    print(f"🤖 Calling Tool: {fn.name}")
                    if fn.name == "search_vaccine_database":
                        # Handle potential argument parsing issues safely
                        args = dict(fn.args)
                        q = args.get('query') or next(iter(args.values()), "")
                        
                        result = search_vaccine_database(query=q)
                        
                        response = chat.send_message(
                            genai.protos.Content(
                                parts=[genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=fn.name,
                                        response={'result': result}
                                    )
                                )]
                            )
                        )

        # 4. FINAL ANSWER extraction
        final_answer = response.text

        # 5. CONSTRUCT UPDATED HISTORY
        # Start with the history we received
        updated_history = list(req.history)
        # Add the user's NEW message
        updated_history.append(HistoryMessage(role="user", content=req.message))
        # Add the model's NEW response
        updated_history.append(HistoryMessage(role="model", content=final_answer))

        # 6. Return both the answer AND the new history
        return ChatResponse(
            response=final_answer,
            history=updated_history
        )

    except Exception as e:
        print(f"Gemini Error Details: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    










@app.post("/center_chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        # 1. Initialize Model (Same as before)
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash', # Ensure you use a valid model name
            tools=gemini_tools,
            system_instruction="You are a helpful assistant for Bangladesh vaccination preservation. Use the 'search_vaccine_database' tool for factual vaccine info. If you dont fine info in this database, answer from your own knowledge. But dont tell the user that you didn't find the information in the database. Make sure your response is nicely formatted. If the user ask something like what was my previous prompt or conversation you reply your past conversation was about vaccines. Also add something more if necessary. Also if the user ask anything that is not regarding to vaccine or vaccine preservation, tell the user to ask vaccine or vaccine preservation related questions."
        )

        # 2. Reconstruct History for Gemini
        # We prefer the last few messages for context window efficiency, 
        # but you might want to increase this number (e.g., last 10 or 20)
        gemini_history = []
        for msg in req.history[-3:]:
             gemini_history.append(content_types.to_content({"role": msg.role, "parts": [msg.content]}))

        chat = model.start_chat(history=gemini_history)

        # 3. Send Message & Handle Tool Loop (Same as before)
        response = chat.send_message(req.message)

        while response.parts and any(part.function_call for part in response.parts):
            for part in response.parts:
                if fn := part.function_call:
                    print(f"🤖 Calling Tool: {fn.name}")
                    if fn.name == "search_vaccine_database":
                        # Handle potential argument parsing issues safely
                        args = dict(fn.args)
                        q = args.get('query') or next(iter(args.values()), "")
                        
                        result = search_vaccine_database(query=q)
                        
                        response = chat.send_message(
                            genai.protos.Content(
                                parts=[genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=fn.name,
                                        response={'result': result}
                                    )
                                )]
                            )
                        )

        # 4. FINAL ANSWER extraction
        final_answer = response.text

        # 5. CONSTRUCT UPDATED HISTORY
        # Start with the history we received
        updated_history = list(req.history)
        # Add the user's NEW message
        updated_history.append(HistoryMessage(role="user", content=req.message))
        # Add the model's NEW response
        updated_history.append(HistoryMessage(role="model", content=final_answer))

        # 6. Return both the answer AND the new history
        return ChatResponse(
            response=final_answer,
            history=updated_history
        )

    except Exception as e:
        print(f"Gemini Error Details: {e}")
        raise HTTPException(status_code=500, detail=str(e))























# uvicorn AI_and_ML:app --reload