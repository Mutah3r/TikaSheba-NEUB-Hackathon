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


from fastapi.middleware.cors import CORSMiddleware

# --- New CORS Configuration ---
# Define the origins that are allowed to make requests to your API.
# You MUST change 'http://localhost:8080' to the actual URL/Port of your frontend or external app.
origins = [
    "*", # ⚠️ WARNING: Use "*" only for testing/development. For production, specify exact domains.
    "http://localhost",
    "http://localhost:8000", # If your external data API is running on this port
    "http://localhost:5173", # Example port for a common frontend framework
    # Add any other origins (e.g., actual domain names) that need access
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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








@app.post("/authority_chat", response_model=ChatResponse)
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










@app.post("/faq_chat", response_model=ChatResponse)
async def faq_chat_endpoint(req: ChatRequest):
    try:
        # 1. Initialize Model (No tools needed for basic FAQ)
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash', # Use your preferred stable model version
            system_instruction= "You are a helpful FAQ assistant for Bangladesh vaccination services. Answer questions clearly, accurately, and concisely based on your general knowledge about vaccines in Bangladesh. Make sure your response is nicely formatted. If the user asks anything NOT related to vaccines, health, or preservation, politely refuse and ask them to stay on topic. To give you some context, here are answer to some frequently asked questions : Here are the answers to your FAQs, refined for clarity and tone: * **How do I register if I don't have a National ID (NID) card?** You can register using your Birth Certificate number if you do not have an NID card. * **Can I change my vaccination center after booking an appointment?** Yes, you can cancel your current appointment and book a new one at a different center. However, we highly discourage this as it may waste a valuable slot at the original center. * **What should I do if I miss my scheduled appointment?** You will need to book a new appointment. Please try to be punctual in the future to avoid wasting vaccine center resources and slots. * **Is my personal information secure?** Yes, your data is completely secure. We do not use your personal information for anything outside of this vaccination system. * **How can I report side effects after getting vaccinated?** Most vaccines have common, mild side effects like fever or weakness for 1-2 days. If your condition concerns you, please contact your vaccination center or consult a doctor. * **Can I book an appointment for someone else (e.g., a family member)?** No, you cannot book directly from your account. However, you can create a separate account for them and book an appointment through their profile. * **What if I lost my digital vaccine card? Can I regenerate it?** Yes, you can regenerate and download your digital vaccine card at any time from your profile. * **Are the vaccines free, or do I need to pay?** All mandatory government (EPI) vaccines are free. Some specialized or optional vaccines may have a cost. * **How do I know if I am eligible for a specific vaccine?** Everyone is eligible for vaccines based on their age and vaccination history. The system will show you which vaccines you currently need. * **Can I use this system if I am a foreign national living in the country?** No, currently this system is designed only for Bangladeshi citizens with a valid NID or Birth Certificate. What happens if someone else used my NID to register? Please contact the relevant authority immediately or call our hotline for assistance."


        )

        # 2. Reconstruct History for context
        # Keeping last few messages helps with follow-up questions (e.g., "What about for kids?")
        gemini_history = []
        for msg in req.history[-5:]: 
             gemini_history.append(content_types.to_content({"role": msg.role, "parts": [msg.content]}))

        chat = model.start_chat(history=gemini_history)

        # 3. Send Message (Just a simple prompt-response now)
        response = chat.send_message(req.message)

        # 4. Extract Final Answer
        final_answer = response.text

        # 5. Construct Updated History
        updated_history = list(req.history)
        updated_history.append(HistoryMessage(role="user", content=req.message))
        updated_history.append(HistoryMessage(role="model", content=final_answer))

        # 6. Return response and new history
        return ChatResponse(
            response=final_answer,
            history=updated_history
        )

    except Exception as e:
        # print(f"Gemini FAQ Error: {e}") # Optional: Log errors internally
        raise HTTPException(status_code=500, detail=str(e))






import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from prophet import Prophet
import logging

# Setup basic logging
logging.getLogger("prophet").setLevel(logging.WARNING)
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)




# --- 1. Data Models ---

class DataPoint(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format", example="2023-10-27")
    amphules_used: float = Field(..., description="Number of amphules used on this date", example=120.5)

class ForecastRequest(BaseModel):
    history: List[DataPoint] = Field(..., description="Historical data array")
    days_to_forecast: int = Field(..., ge=1, le=365, description="Number of days to predict into the future", example=30)

class ForecastPoint(BaseModel):
    date: str
    predicted_usage: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    forecast_total: float
    days_forecasted: int
    daily_forecast: List[ForecastPoint]

# --- 2. Forecasting Logic ---

def run_prophet_model(history: List[DataPoint], n_days: int) -> Dict[str, Any]:
    # 1. Prepare DataFrame for Prophet
    # Prophet specifically requires columns named 'ds' (Date) and 'y' (Target Value)
    df = pd.DataFrame([item.model_dump() for item in history])
    df.rename(columns={'date': 'ds', 'amphules_used': 'y'}, inplace=True)
    df['ds'] = pd.to_datetime(df['ds'])

    # Remove any potential duplicates or NaNs that might crash Prophet
    df = df.dropna().drop_duplicates(subset='ds').sort_values(by='ds')

    if len(df) < 30:
         # Warning: Prophet needs decent historical data to be accurate.
         # We proceed, but results might be poor for very small datasets.
         pass

    # 2. Initialize and Fit Prophet Model
    # We enable daily_seasonality if data is granular enough, otherwise Prophet handles weekly/yearly automatically
    m = Prophet(daily_seasonality=True if len(df) > 90 else False)
    
    
    
    
    
    
    # fit the model
    m.fit(df)

    # 3. Create Future Dataframe
    future = m.make_future_dataframe(periods=n_days, freq='D')

    # 4. Predict
    forecast = m.predict(future)

    # 5. Extract only the future N days
    future_forecast = forecast.tail(n_days)

    # 6. Format Results
    results = []
    total_predicted = 0.0

    for _, row in future_forecast.iterrows():
        # Ensure non-negative predictions for physical goods like amphules
        predicted_val = max(0.0, round(row['yhat'], 2))
        
        results.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "predicted_usage": predicted_val,
            "lower_bound": max(0.0, round(row['yhat_lower'], 2)),
            "upper_bound": max(0.0, round(row['yhat_upper'], 2))
        })
        total_predicted += predicted_val

    return {
        "forecast_total": round(total_predicted, 2),
        "days_forecasted": n_days,
        "daily_forecast": results
    }

# --- 3. API Endpoint ---

@app.post("/forecast", response_model=ForecastResponse)
async def get_vaccine_forecast(req: ForecastRequest):
    """
    Accepts historical vaccine usage data and returns a future forecast using Meta Prophet.
    """
    try:
        if not req.history:
             raise HTTPException(status_code=400, detail="Historical data cannot be empty.")

        results = run_prophet_model(req.history, req.days_to_forecast)
        return results
        
    except Exception as e:
        # In production, log the full error traceback
        print(f"Forecasting Error: {e}")
        raise HTTPException(status_code=500, detail=f"Model forecasting failed: {str(e)}")








import httpx # Needed for making external asynchronous HTTP requests

# --- New Data Models for Input ---

class DemandForecastRequest(BaseModel):
    centre_vaccine_id: str = Field(..., example="690e473c078a4481e3c69863")
    days_to_forecast: int = Field(..., ge=1, le=365, example=30)

# --- New API Endpoint ---

@app.post("/forecast_demand", response_model=ForecastResponse)
async def forecast_demand_endpoint(req: DemandForecastRequest):
    """
    Fetches historical usage data for a specific vaccine at a center from an external API,
    transforms it, and then uses the internal /forecast endpoint (Prophet model) to predict future demand.
    """
    # URL for the external historical data API
    external_api_url = f"http://localhost:8000/api/staff/centre_vaccine/{req.centre_vaccine_id}/daily"
    
    try:
        # 1. Fetch historical data from external API
        async with httpx.AsyncClient() as client:
            response = await client.get(external_api_url, timeout=30.0)
            response.raise_for_status() # Raises an exception for 4xx/5xx status codes
            external_data = response.json()
            
    except httpx.HTTPError as e:
        # Catch errors from the external service call
        print(f"External API Error: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch data from the external historical API. Check external service status. Error: {e.response.status_code if e.response else 'Unknown'}"
        )
    except Exception as e:
        # Catch general errors during the fetch process
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during external data fetch: {str(e)}"
        )

    # 2. Extract and transform the data
    history_data_points = []
    
    daily_records = external_data.get("daily", [])
    
    if not daily_records:
        raise HTTPException(
            status_code=404, 
            detail="External API returned no historical usage data for this center/vaccine ID."
        )

    for record in daily_records:
        # Transformation: Map 'total_dose_used' to 'amphules_used'
        history_data_points.append(
            DataPoint(
                date=record.get("date"),
                # Ensure the value is converted to float as required by the DataPoint model
                amphules_used=float(record.get("total_dose_used", 0)) 
            )
        )

    # 3. Construct the request for the internal /forecast API
    internal_req = ForecastRequest(
        history=history_data_points,
        days_to_forecast=req.days_to_forecast
    )

    # 4. Call the existing internal forecasting function (get_vaccine_forecast) directly
    try:
        # Awaiting the call to the function defined for the /forecast endpoint
        forecast_result = await get_vaccine_forecast(internal_req)
        return forecast_result

    except HTTPException as e:
        # Propagate exceptions raised by the internal model (e.g., if history is too short)
        raise e
    except Exception as e:
        print(f"Internal Forecasting Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal forecasting failed after data transformation: {str(e)}")








# pip3 install fastapi uvicorn pydantic python-dotenv pandas google-generativeai pinecone prophet

# uvicorn AI_and_ML:app --reload --port 5000