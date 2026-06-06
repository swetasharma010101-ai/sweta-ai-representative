# Sweta Sharma — Resume

## Contact
- Email: sweta.sharma@email.com
- GitHub: github.com/swetasharma
- LinkedIn: linkedin.com/in/swetasharma
- Location: Bangalore, India

## Summary
AI/ML Engineer with 3+ years of experience building production-grade LLM applications,
RAG pipelines, and voice AI systems. Passionate about turning research into reliable,
low-latency products. Strong foundations in Python, cloud infrastructure, and MLOps.

## Education
**B.Tech in Computer Science Engineering**
XYZ Institute of Technology, Bangalore — 2021
CGPA: 8.7 / 10

## Skills
- **Languages:** Python, TypeScript, SQL, Bash
- **LLM / AI:** LangChain, LlamaIndex, OpenAI, Anthropic Claude, Hugging Face
- **RAG:** ChromaDB, Pinecone, Weaviate, FAISS, text-embedding-3-small
- **Voice AI:** ElevenLabs, Whisper, Deepgram, Twilio, WebRTC
- **Backend:** FastAPI, Flask, Node.js, PostgreSQL, Redis
- **Frontend:** React, TypeScript, Tailwind CSS
- **DevOps:** Docker, GitHub Actions, AWS (EC2, S3, Lambda), Railway, Vercel
- **MLOps:** Weights & Biases, MLflow, Prometheus

## Work Experience

### AI Engineer — Acme AI Labs (2023 – Present)
- Built a multi-tenant RAG platform serving 50k+ queries/day with p95 latency < 1.2s
- Designed a voice-based interview assistant using ElevenLabs + Twilio that cut recruiter
  screening time by 60%
- Reduced hallucination rate from 18% to 3.2% via better chunking strategy + hybrid BM25+dense retrieval
- Led migration from OpenAI-only to multi-provider LLM routing (Claude, GPT-4o, Mistral),
  saving ~40% on inference costs

### ML Engineer Intern — Startup XYZ (2022)
- Fine-tuned BERT for intent classification (F1: 0.91) on a customer-support dataset
- Built a data pipeline to process 2M+ tweets/day for sentiment analysis using Kafka + Spark
- Delivered a real-time dashboard in React + FastAPI to visualise model predictions

## Projects

### PersonaBot (github.com/swetasharma/personabot)
AI persona framework — voice + chat + calendar, production-ready.
Stack: FastAPI, LangChain, ChromaDB, ElevenLabs, Twilio, Cal.com, React + Vite.
Handles RAG grounding over personal documents and GitHub repos.
Sub-2s first voice response, <5% hallucination rate on golden eval set.

### RAG-Bench (github.com/swetasharma/rag-bench)
Open-source evaluation suite for RAG pipelines.
Stack: Python, LangChain, ChromaDB, Anthropic Claude (judge model).
Measures precision@k, recall@k, faithfulness, and answer relevance.
Used by 200+ GitHub stars.

### VoiceKit (github.com/swetasharma/voicekit)
Lightweight Python SDK for building voice agents on top of ElevenLabs + Deepgram.
Stack: Python, asyncio, WebSockets, ElevenLabs API, Deepgram API.
<200ms STT + TTS round-trip in optimised mode.

## Certifications
- AWS Certified Machine Learning – Specialty (2023)
- DeepLearning.AI LangChain for LLM Application Development (2023)
