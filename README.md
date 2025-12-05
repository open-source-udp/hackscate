# HacksCATE 📚

Plataforma de estudio inteligente que permite a estudiantes universitarios acceder, buscar y estudiar material académico utilizando inteligencia artificial.

## Motivacion
Otorgarle al estudiante la capacidad de poder estudiar en la misma plataforma donde se encuentra el material de semestres anteriores y no requerir de herramientas ajenas a la universidad. Esto permite generar un ecosistema de aprendizaje unificado, donde el alumno no pierde tiempo saltando entre aplicaciones, evitando la dependencia de plataformas externas. Además, centralizar los recursos académicos abre la puerta a experiencias de estudio más inteligentes, como búsqueda semántica, generación de resúmenes, creación automática de flashcards y mapas mentales basados en el material oficial. Esto beneficia tanto a quienes buscan repasar conceptos clave como a quienes necesitan apoyo para organizar su propio proceso de estudio. En conjunto, esto se traduce en una plataforma más eficiente, accesible y personalizada, alineada con la necesidad actual de herramientas que potencien el rendimiento académico sin fricciones ni barreras tecnológicas.

## 🎯 Características

- **📁 Visualización de archivos**: Navega y descarga archivos PDF desde almacenamiento en la nube (Cloudflare R2)
- **🔍 Búsqueda inteligente**: Filtra archivos por contenido usando RAG (Retrieval-Augmented Generation)
- **💬 Chat Q&A**: Haz preguntas sobre el contenido de los documentos y obtén respuestas con citas
- **🎴 Flashcards**: Genera tarjetas de estudio automáticamente basadas en el contenido de los PDFs
- **📎 Selección de archivos**: Adjunta archivos específicos al chat o generador de flashcards

## 🏗️ Arquitectura

El proyecto está compuesto por dos componentes principales:

```
hackscate/
├── frontend/          # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes de UI
│   │   ├── services/      # Servicios de API
│   │   └── ...
│   └── server/        # Servidor Express para proxy de R2
│
└── RAGentHacksCATE/   # Backend de IA (Python)
    ├── app/
    │   ├── controllers/    # Conversation Manager
    │   ├── data/           # Generacion de Embbedings
    │   ├── models/         # Modelos LLM
    │   ├── rag/            # Sistema RAG
    │   └── utils/          # Estructura de Conversa
    ├── api.py       # API FastAPI
    └── main.py      # Interfaz CLI (opcional)
```

## 🚀 Instalación

### Requisitos previos

- Node.js 18+
- Python 3.10+
- APYKEY OpenAI
- Cuenta de Cloudflare R2 (para almacenamiento de archivos)

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo (frontend + servidor proxy)
npm run dev:all
```

### Backend RAG

```bash
cd RAGentHacksCATE

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o: venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.txt .env
# Editar .env con tus credenciales

# Iniciar servidor
python api.py
```

## ⚙️ Configuración

### Variables de entorno del Frontend (`.env`)

```env
# Cloudflare R2
VITE_R2_ACCOUNT_ID=tu_account_id
VITE_R2_ACCESS_KEY_ID=tu_access_key
VITE_R2_SECRET_ACCESS_KEY=tu_secret_key
VITE_R2_BUCKET_NAME=tu_bucket

# URLs de API
VITE_API_URL=http://localhost:3001
VITE_RAG_API_URL=http://localhost:8000
```

### Variables de entorno del Backend (`.env`)

```env
OPENAI_API_KEY= "OPENAI_API_KEY"

# Directorio donde se guardará la base de datos de Chroma
CHROMA_PERSIST_DIR=./chroma_db

# Tamaño máximo de cada chunk de texto
MAX_CHUNK_SIZE=100000

# Nombre del modelo de embeddings a usar (OpenAI u otro proveedor)
EMBEDDING_MODEL=text-embedding-3-small

# Modelo LLM principal (gpt-5 nano no disponible)
LLM_MODEL=gpt-4.1-nano

# Forzar siempre OCR con Marker (true/false)
FORCE_MARKER_OCR=false

# Idiomas a usar en OCR (separados por coma)
OCR_LANGS=en,es

# Nivel de logueo (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

```
## 📡 API Endpoints

### Servidor Proxy (Express - Puerto 3001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/files/:folder` | Lista archivos de una carpeta en R2 |
| GET | `/api/download?key=` | Descarga un archivo de R2 |

### API RAG (FastAPI - Puerto 8000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/query` | Consulta al sistema RAG |

#### Modos de consulta (`/api/query`)

**Chat Q&A** (`mode: "qa"`):
```json
{
  "prompt": "¿Qué es la programación lineal?",
  "ramo": "CII-2750",
  "mode": "qa",
  "files": ["Control_1_2022-1"],
  "use_rag": true
}
```

**Búsqueda Inteligente** (`mode: "search"`):
```json
{
  "prompt": "restricciones",
  "ramo": "CII-2750",
  "mode": "search"
}
```

**Flashcards** (`mode: "flashcards"`):
```json
{
  "prompt": "Genera flashcards sobre optimización",
  "ramo": "CII-2750",
  "mode": "flashcards"
}
```

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **CSS Modules** - Estilos con scope
- **Express** - Servidor proxy para R2

### Backend
- **FastAPI** - Framework de API
- **LangChain** - Orquestación de LLM
- **Pydantic** - Estandarizacion de preguntas y respuestas
- **ChromaDB** - Base de datos vectorial
- **Tiktoken** - BPE tokeniser 
- **marker-pdf** - OCR y parsing de PDFs
- **OpenAI** - Modelos de lenguaje

## 📂 Estructura de Componentes

```
src/components/
├── Chat/           # Chat Q&A con el LLM
├── FileItem/       # Item individual de archivo
├── FileList/       # Lista de archivos
├── Flashcards/     # Generador y visor de flashcards
├── SearchBar/      # Barra de búsqueda con toggle inteligente
└── ToolsPanel/     # Panel de herramientas (tabs)
```

## 🎨 Funcionalidades de la UI

### Selección de archivos
- Click en checkbox para seleccionar/deseleccionar
- Click en botón de descarga para descargar el archivo
- Los archivos seleccionados se muestran como adjuntos en Chat y Flashcards

### Búsqueda inteligente
- Toggle para activar/desactivar búsqueda por contenido
- Usa el sistema RAG para encontrar archivos relevantes
- Debounce de 500ms para evitar llamadas excesivas

### Chat
- Envía preguntas con o sin archivos adjuntos
- Muestra fuentes citadas en las respuestas
- Botones de preguntas de seguimiento

### Flashcards
- Genera tarjetas basadas en el contenido de los PDFs
- Muestra dificultad (easy/medium/hard)
- Click para voltear y ver la respuesta

## 👥 Contribuidores

Proyecto desarrollado para [HacksCATE](https://github.com/open-source-udp/hackscate) - Universidad Diego Portales


- [Samuel Angulo](https://github.com/polaarts)
- [Matias Diaz Llancan](https://github.com/theramdomx)
- [Hugo Rojas](https://github.com/HugoosZ)
