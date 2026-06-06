"""
RAG Pipeline — uses FREE local HuggingFace embeddings (no API key needed).
Model: all-MiniLM-L6-v2 (~90MB, downloads once automatically)
"""

import os
from pathlib import Path
from typing import Optional

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

CHROMA_DIR  = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
COLLECTION  = "sweta_persona"


class RAGPipeline:
    def __init__(self):
        print("  Loading local embedding model (downloads once ~90MB)...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.vectorstore: Optional[Chroma] = None
        self.retriever = None

    def load(self):
        if Path(CHROMA_DIR).exists():
            self.vectorstore = Chroma(
                collection_name=COLLECTION,
                embedding_function=self.embeddings,
                persist_directory=CHROMA_DIR,
            )
            self.retriever = self.vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={"k": 6, "fetch_k": 20},
            )
            print(f"✅ Loaded ChromaDB from {CHROMA_DIR}")
        else:
            print("⚠️  ChromaDB not found. Run: python -m rag.ingest")

    def retrieve(self, query: str) -> str:
        if self.retriever is None:
            return "[RAG not initialised — run python -m rag.ingest first]"
        docs = self.retriever.invoke(query)
        if not docs:
            return "[No relevant context found]"
        parts = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown")
            parts.append(f"[Chunk {i} | {source}]\n{doc.page_content}")
        return "\n\n---\n\n".join(parts)
