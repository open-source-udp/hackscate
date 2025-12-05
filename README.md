# HacksCATE 📚

Plataforma de estudio inteligente que permite a estudiantes universitarios acceder, buscar y estudiar material académico utilizando inteligencia artificial.

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
    │   ├── rag/       # Sistema RAG
    │   └── models/    # Modelos LLM
    └── api.py         # API FastAPI
```

## 🚀 Instalación

### Requisitos previos

- Node.js 18+
- Python 3.10+
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
- **ChromaDB** - Base de datos vectorial
- **OpenAI/Azure** - Modelos de lenguaje

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

## 📄 Licencia

MIT License
