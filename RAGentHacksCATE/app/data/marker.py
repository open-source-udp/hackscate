import subprocess
import tempfile
import os
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered
from app.utils.logger import logger

def extract_text_with_marker(pdf_path: str, force_ocr: bool = False, langs: str = "en,es") -> str:
    """Extrae texto de PDF usando Marker con firma compatible.
    Nota: algunas versiones de PdfConverter no aceptan argumentos extra; se usa constructor mínimo.
    """
    artifact_dict = create_model_dict()

    # Constructor mínimo compatible (sin languages, sin force_ocr)
    converter = PdfConverter(artifact_dict=artifact_dict)

    # Invocación simple; si la versión soporta OCR, se aplicará según su configuración interna
    rendered = converter(pdf_path)
    text, _, _ = text_from_rendered(rendered)
    return text
