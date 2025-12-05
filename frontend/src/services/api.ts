const API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';
const DEFAULT_RAMO = 'CII-2750';

// Tipos de respuesta de la API
export interface QAResponseData {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sources: Array<{ file: string; page: number }>;
  limitations: string | null;
  followups: string[];
}

export interface SearchResponseData {
  matching_files: Array<{
    file: string;
    relevance: 'high' | 'medium' | 'low';
    reason: string;
    matching_topics: string[];
    sample_content: string;
  }>;
  total_matches: number;
  search_summary: string;
  no_matches_reason: string | null;
}

export interface FlashcardData {
  id: number;
  question: string;
  answer: string;
  source: { file: string; page: number };
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface FlashcardsResponseData {
  flashcards: FlashcardData[];
  total_generated: number;
  topics_covered: string[];
}

export interface APIResponse {
  answer: string;
  sources: string[];
  ramo: string;
}

// Utilidad para parsear el JSON anidado en "answer"
function parseAnswerJSON<T>(response: APIResponse): T {
  try {
    // Si answer ya es un objeto, devolverlo directamente
    if (typeof response.answer === 'object' && response.answer !== null) {
      console.log('Answer is already an object:', response.answer);
      return response.answer as T;
    }
    
    // Si es string, intentar parsearlo
    if (typeof response.answer === 'string') {
      // Limpiar posibles caracteres problemáticos al inicio/final
      const cleanedAnswer = response.answer.trim();
      const parsed = JSON.parse(cleanedAnswer);
      console.log('Parsed API response:', parsed);
      return parsed as T;
    }
    
    throw new Error('Formato de respuesta no reconocido');
  } catch (err) {
    console.error('Parse error details:', err);
    console.error('Response answer type:', typeof response.answer);
    console.error('Response answer (first 500 chars):', 
      typeof response.answer === 'string' ? response.answer.substring(0, 500) : response.answer
    );
    
    // Último intento: si parece ser JSON válido pero falla, intentar con eval seguro
    if (typeof response.answer === 'string' && response.answer.startsWith('{')) {
      try {
        // Intento alternativo reemplazando caracteres problemáticos
        const sanitized = response.answer
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return JSON.parse(sanitized) as T;
      } catch {
        // Si aún falla, continuar con el error original
      }
    }
    
    throw new Error('Error al parsear la respuesta de la API');
  }
}

// Extraer nombre de archivo sin extensión ni ruta
export function extractFileName(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath;
  return fileName.replace(/\.[^/.]+$/, ''); // Quitar extensión
}

/**
 * Chat Q&A - Envía un mensaje al chat y obtiene una respuesta
 */
export async function sendChatMessage(
  prompt: string,
  files?: string[],
  ramo: string = DEFAULT_RAMO
): Promise<{ data: QAResponseData; sources: string[] }> {
  // Convertir los keys de archivos a nombres sin extensión
  const fileNames = files?.map(extractFileName) || [];

  const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      ramo,
      mode: 'qa',
      files: fileNames.length > 0 ? fileNames : undefined,
      use_rag: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.status}`);
  }

  const apiResponse: APIResponse = await response.json();
  const data = parseAnswerJSON<QAResponseData>(apiResponse);

  return {
    data,
    sources: apiResponse.sources,
  };
}

/**
 * Búsqueda Inteligente - Filtra archivos por contenido relacionado
 * Devuelve los nombres de archivos que coinciden con la búsqueda
 */
export async function smartSearch(
  query: string,
  ramo: string = DEFAULT_RAMO
): Promise<{ sources: string[]; rawResponse: APIResponse }> {
  const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: query,
      ramo,
      mode: 'search',
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en la búsqueda: ${response.status}`);
  }

  const apiResponse: APIResponse = await response.json();

  return {
    sources: apiResponse.sources,
    rawResponse: apiResponse,
  };
}

/**
 * Generar Flashcards - Genera tarjetas de estudio basadas en el contenido
 */
export async function generateFlashcards(
  prompt: string = 'Genera flashcards sobre el contexto adjuntado.',
  files?: string[],
  ramo: string = DEFAULT_RAMO
): Promise<{ data: FlashcardsResponseData; sources: string[] }> {
  const fileNames = files?.map(extractFileName) || [];

  const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      ramo,
      mode: 'flashcards',
      files: fileNames.length > 0 ? fileNames : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al generar flashcards: ${response.status}`);
  }

  const apiResponse: APIResponse = await response.json();
  const data = parseAnswerJSON<FlashcardsResponseData>(apiResponse);

  return {
    data,
    sources: apiResponse.sources,
  };
}
