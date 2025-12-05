from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.chatbot import Chatbot
from app.utils.logger import logger
from typing import Optional, List, Dict

app = FastAPI(
    title="RAGent API",
    description="API para chatbot con RAG",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para la petición
class QueryRequest(BaseModel):
    prompt: str
    ramo: str
    files: Optional[List[str]] = None  # lista de nombres de archivos a enfocar
    use_rag: Optional[bool] = True

# Modelo para la respuesta
class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None
    ramo: str

# Instancias de chatbots por colección (cache)
chatbot_instances: Dict[str, Chatbot] = {}

def get_chatbot(collection_name: str) -> Chatbot:
    """Obtiene o crea una instancia de chatbot para una colección específica."""
    if collection_name not in chatbot_instances:
        chatbot_instances[collection_name] = Chatbot(
            use_rag=True, 
            collection_name=collection_name
        )
    return chatbot_instances[collection_name]

@app.get("/")
async def root():
    """Endpoint de bienvenida."""
    return {
        "message": "RAGent API está funcionando",
        "version": "1.0.0",
        "endpoints": {
            "query": "/api/query",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Verifica el estado de la API."""
    return {"status": "healthy"}

@app.post("/api/query", response_model=QueryResponse)
async def query_chatbot(request: QueryRequest):
    """
    Procesa una consulta del usuario.
    
    Args:
        request: Objeto con el prompt del usuario y el ramo (colección)
        
    Returns:
        Respuesta del chatbot con la respuesta y las fuentes (si usa RAG)
    """
    try:
        logger.info(f"Consulta recibida - Ramo: {request.ramo}, Prompt: {request.prompt[:50]}...")

        # Obtener el chatbot para la colección específica
        chatbot = get_chatbot(request.ramo)

        # Procesar la consulta
        result = chatbot.ask(
            request.prompt,
            use_rag_override=request.use_rag,
            files=request.files,
        )

        # Extraer fuentes si existen
        sources: List[str] = []
        if result.get("source_documents"):
            sources_set = set()
            for doc in result["source_documents"]:
                if hasattr(doc, "metadata"):
                    source = doc.metadata.get("source", "desconocido")
                    sources_set.add(source)
            sources = list(sources_set)

        response = QueryResponse(
            answer=result.get("answer", ""),
            sources=sources if sources else None,
            ramo=request.ramo,
        )

        logger.info(f"Respuesta enviada - Ramo: {request.ramo}")
        return response

    except Exception as e:
        logger.error(f"Error procesando consulta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la consulta: {str(e)}",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
