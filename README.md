# Sweta Sharma AI Persona

A local AI persona for Sweta Sharma that can chat about her resume and GitHub work, expose voice/calendar endpoints, and help book interview slots.

## Local URLs

- Frontend chat: http://localhost:5173/chat
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

## Architecture

```text
Browser chat / booking UI (React + Vite)
        |
        v
FastAPI backend
        |
        +-- Chat router -> Agent service -> Groq or Gemini, with local RAG fallback
        +-- RAG pipeline -> ChromaDB + local HuggingFace embeddings
        +-- Calendar router -> Cal.com API or demo slots
        +-- Voice router -> Twilio + ElevenLabs
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| LLM | Groq by default, Gemini optional |
| RAG | LangChain, ChromaDB |
| Embeddings | HuggingFace sentence-transformers, `all-MiniLM-L6-v2` |
| Calendar | Cal.com API, with demo fallback slots |
| Voice | Twilio and ElevenLabs |

## Setup

### 1. Backend

```powershell
cd C:\Users\preet\sweta-ai-persona\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend

```powershell
cd C:\Users\preet\sweta-ai-persona\frontend
npm install
```

### 3. Environment

Create `C:\Users\preet\sweta-ai-persona\.env` from `.env.example` and set at least one valid LLM key:

```env
GROQ_API_KEY=your_valid_groq_key
# or
GEMINI_API_KEY=your_valid_gemini_key

EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_PERSIST_DIR=./chroma_db
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

The app now has a local RAG fallback, so chat will still return a grounded response if the external LLM key is missing or invalid. A valid LLM key is still recommended for richer answers.

### 4. Ingest Resume and GitHub Data

```powershell
cd C:\Users\preet\sweta-ai-persona\backend
.\venv\Scripts\activate
python -m rag.ingest
```

### 5. Run Locally

Open one terminal for the backend:

```powershell
cd C:\Users\preet\sweta-ai-persona\backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Open another terminal for the frontend:

```powershell
cd C:\Users\preet\sweta-ai-persona\frontend
npm run dev
```

Then open http://localhost:5173/chat.

## Troubleshooting

- If chat says the external LLM key is not working, replace `GROQ_API_KEY` or add `GEMINI_API_KEY` in `.env`, then restart the backend.
- If answers say the local knowledge base is not loaded, run `python -m rag.ingest` from the backend folder.
- If the browser cannot reach the API, confirm the backend is running at http://localhost:8000/docs and the frontend is using `VITE_API_URL=http://localhost:8000` when needed.
- If booking returns no slots, check the Cal.com settings or temporarily remove Cal.com keys to use demo slots.

## Notes

Your current local development URLs are:

- Frontend: http://localhost:5173/chat
- Backend: http://localhost:8000/docs
