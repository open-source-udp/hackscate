from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.utils import config
from typing import List, Union, Dict
import unicodedata
import re

def normalize_text(s: str) -> str:
    s = s or ""
    s = unicodedata.normalize('NFKC', s)
    s = s.replace('\r\n', '\n').replace('\r', '\n')
    s = s.replace('\t', ' ')
    s = '\n'.join(re.sub(r' {2,}', ' ', line).strip() for line in s.split('\n'))
    return s.strip()


def chunk_text(text: Union[str, List[str]], chunk_size_chars: int = None, chunk_overlap: int = None) -> List[Dict]:
    """
    Devuelve un único chunk por archivo, sin importar su tamaño.
    Si `text` es lista (páginas), se une con saltos de línea.
    """
    if isinstance(text, list):
        normalized_pages = [normalize_text(p or "") for p in text]
        full = "\n".join(normalized_pages)
        if not full.strip():
            return []
        return [{
            "page_start": 0,
            "page_end": max(0, len(normalized_pages) - 1),
            "char_start": 0,
            "char_end": len(full),
            "text": full,
        }]
    else:
        normalized = normalize_text(text or "")
        if not normalized.strip():
            return []
        return [{
            "page_start": -1,
            "page_end": -1,
            "char_start": 0,
            "char_end": len(normalized),
            "text": normalized,
        }]
