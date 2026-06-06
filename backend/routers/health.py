from fastapi import APIRouter, Request

router = APIRouter()

@router.get("")
async def health(request: Request):
    rag_ready = hasattr(request.app.state, "rag") and request.app.state.rag.vectorstore is not None
    return {
        "status":    "ok",
        "rag_ready": rag_ready,
        "persona":   "Sweta Sharma AI",
    }
