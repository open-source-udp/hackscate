from app.rag.retriever import get_relevant_docs, get_vectorstore
from app.models.llm import Agent
from app.utils import config
from app.utils.logger import logger
from typing import Dict, Any, Tuple, List, Optional
import tiktoken

llm = Agent()

SYSTEM_INSTRUCTIONS = (
    "Eres un asistente académico que SOLO puede usar el contexto recuperado desde PDFs. "
    "Si la información no está en el contexto, responde exactamente: 'No disponible en el contexto'. No inventes. "
    "Si te pide información acerca del temario en distintos formatos, por ejemplo: resúmenes, preguntas de examen y cualquier cosa relacionado al contenido de los archivos. Devuelve la información solicitada basándote SOLO en el contexto proporcionado. "
    "Cita siempre las fuentes como [PDF: <nombre>, pág <n>]. Español claro y directo. "
    "Devuelve SIEMPRE un JSON válido y NADA más (sin texto fuera del objeto JSON). "
    
    "Modos soportados (input 'mode'): 'qa', 'search', 'flashcards'. "
    
    "Esquemas de salida obligatorios por modo: "
    
    "qa -> {"
    "\"answer\":\"string (respuesta completa con citas inline [PDF: nombre, pág X])\","
    "\"confidence\":\"high|medium|low\","
    "\"sources\":[{\"file\":\"string\",\"page\":number}],"
    "\"limitations\":\"string|null\","
    "\"followups\":[\"string\"]"
    "}; "
    
    "search -> {"
    "\"matching_files\":[{"
    "\"file\":\"string (nombre del archivo)\","
    "\"relevance\":\"high|medium|low\","
    "\"reason\":\"string (por qué es relevante)\","
    "\"matching_topics\":[\"string\"],"
    "\"sample_content\":\"string (fragmento del contenido relevante)\""
    "}],"
    "\"total_matches\":number,"
    "\"search_summary\":\"string\","
    "\"no_matches_reason\":\"string|null\""
    "}; "
    
    "flashcards -> {"
    "\"flashcards\":[{"
    "\"id\":number,"
    "\"question\":\"string\","
    "\"answer\":\"string\","
    "\"source\":{\"file\":\"string\",\"page\":number},"
    "\"difficulty\":\"easy|medium|hard\","
    "\"topic\":\"string\""
    "}],"
    "\"total_generated\":number,"
    "\"topics_covered\":[\"string\"]"
    "}; "
    
    "Instrucciones por modo: "
    "qa: Responde la pregunta del usuario de forma conversacional, incluye citas inline, sugiere followups relevantes. "
    "search: NO respondas preguntas, solo identifica qué archivos contienen información relacionada con la consulta, ordena por relevancia, explica por qué cada archivo es relevante. "
    "flashcards: Genera 5-15 tarjetas de estudio, varía la dificultad, incluye preguntas conceptuales no solo definiciones. "
    
    "Reglas adicionales: usa solo términos presentes en los PDFs; si hay poca evidencia o ambigüedad, rellena 'limitations' (en qa) o 'no_matches_reason' (en search). "
    
    "Si no hay información suficiente, devuelve: "
    "{\"error\":\"insufficient_context\",\"message\":\"string\",\"suggestions\":[\"string\"]}"
)

def _format_chunk_header(meta: dict, fallback_index: int) -> str:
    src = meta.get("source", "desconocido")
    page = meta.get("page")
    page_str = f", pág {page}" if page is not None else ""
    chunk = meta.get("chunk", fallback_index)
    # Cabecera que ya trae la forma de cita para ayudar al modelo
    return f"[PDF: {src}{page_str}] (chunk={chunk})\n"

def build_prompt(
    context_docs: List[Any],
    question: str,
    mode: str = "qa",
    files_focus: Optional[List[str]] = None,
) -> str:
    """
    Construye un prompt que:
    - Inyecta SYSTEM_INSTRUCTIONS
    - Empaqueta el contexto troceado con cabeceras tipo cita
    - Exige salida SOLO JSON según 'mode'
    """
    max_model_tokens = config.MAX_MODEL_TOKENS
    reserved = config.RESERVED_RESPONSE_TOKENS

    encoding = tiktoken.encoding_for_model(config.LLM_MODEL)

    # Bloque de formato: fuerza salida JSON estricta según mode.
    formatting = (
        "SALIDA ESTRICTA:\n"
        f"- Devuelve SOLO un objeto JSON válido para mode='{mode}'.\n"
        "- No incluyas comentario, markdown ni texto fuera del JSON.\n"
        "- Si la información no está en el contexto, pon 'No disponible en el contexto' en el campo adecuado.\n"
    )

    # Si se especifican files, filtra/prioriza documentos que provienen de esos nombres
    if files_focus:
        focus_set = set(f.lower() for f in files_focus)
        prioritized = []
        others = []
        for d in context_docs:
            meta = d.metadata if hasattr(d, "metadata") else {}
            src = (meta.get("source") or "").lower()
            (prioritized if src in focus_set else others).append(d)
        context_docs = prioritized + others

    # Prepara el bloque de contexto ajustado al presupuesto de tokens
    base_suffix = (
        f"\n\nModo:\n{mode}\n\n"
        "Genera la salida JSON ahora:"
    )
    base_tokens = len(encoding.encode(SYSTEM_INSTRUCTIONS + formatting + base_suffix))
    allowed_tokens_for_context = max_model_tokens - reserved - base_tokens
    if allowed_tokens_for_context <= 0:
        allowed_tokens_for_context = max_model_tokens // 4

    used_tokens = 0
    context_texts = []

    for i, d in enumerate(context_docs):
        meta = d.metadata if hasattr(d, "metadata") else {}
        header = _format_chunk_header(meta, i)
        content = d.page_content or ""
        block = header + content
        tok_count = len(encoding.encode(block))

        if used_tokens + tok_count > allowed_tokens_for_context:
            remaining = allowed_tokens_for_context - used_tokens
            if remaining <= 0:
                break
            # truncado binario del contenido para encajar
            lo, hi = 0, len(content)
            best = 0
            while lo <= hi:
                mid = (lo + hi) // 2
                if len(encoding.encode(header + content[:mid])) <= remaining:
                    best = mid
                    lo = mid + 1
                else:
                    hi = mid - 1
            if best > 0:
                truncated = content[:best]
                context_texts.append(f"{header}{truncated}")
                used_tokens += len(encoding.encode(header + truncated))
            break
        else:
            context_texts.append(block)
            used_tokens += tok_count

    context_block = "\n\n---\n\n".join(context_texts) if context_texts else ""

    files_line = f"Archivos a enfocar: {files_focus}\n" if files_focus else ""
    prompt = (
        f"{SYSTEM_INSTRUCTIONS}\n\n"
        f"{files_line}"
        f"Contexto recuperado (fragmentos con citas integradas):\n{context_block}\n\n"
        f"{formatting}\n"
        f"Pregunta del usuario:\n{question}"
        f"{base_suffix}"
    )
    return prompt

def answer_with_rag(
    question: str,
    k: Optional[int] = None,
    collection_name: Optional[str] = None,
    mode: str = "qa",
    files: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Ejecuta RAG con el modo deseado. El LLM debe devolver SIEMPRE JSON válido.
    """
    docs = get_relevant_docs(question, k=k, collection_name=collection_name)
    prompt = build_prompt(docs, question, mode=mode, files_focus=files)

    encoding = tiktoken.encoding_for_model(config.LLM_MODEL)
    tokens_used = len(encoding.encode(prompt))

    answer_json = llm.generate(prompt)  # Debe ser un string JSON válido
    return {
        "answer": answer_json,
        "source_documents": docs,
        "tokens_used": tokens_used,
        "mode": mode,
        "files": files or []
    }