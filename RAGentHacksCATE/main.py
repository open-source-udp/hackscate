import os
import typer
from app.chatbot import Chatbot
from app.data.ingestion import ingest_files, ingest_file
from app.utils.logger import logger
from app.utils import config
from app.rag.retriever import get_vectorstore
import chromadb
import os

app = typer.Typer()

@app.command()
def ingest(
    ruta_de_archivo: str = typer.Argument(None, help="Ruta de archivo a ingestar (opcional si se usa --paths)"),
    collection: str = typer.Argument("study_collection", help="Nombre de la colección"),
    paths: list[str] = typer.Option(None, help="Lista de rutas a ingestar (alternativa a ruta_de_archivo)"),
    dry_run: bool = False,
):
        """Ingesta documentos en la colección indicada.
        Modo 1: python main.py ingest ruta_de_archivo collection
        Modo 2: python main.py ingest --paths file1.pdf file2.pdf collection
        """
        if paths:
            docs = ingest_files(paths, collection_name=collection, dry_run=dry_run)
        elif ruta_de_archivo:
            docs = ingest_file(ruta_de_archivo, collection_name=collection, dry_run=dry_run)
        else:
            print("Debes proporcionar una ruta_de_archivo o --paths.")
            raise typer.Exit(code=1)

        if dry_run:
            print(f"Dry-run: {len(docs)} chunks would be created/added from provided paths")

@app.command()
def chat(use_rag: bool = True, collection: str = "study_collection"):
    bot = Chatbot(use_rag=use_rag, collection_name=collection)
    print("Modo chat. Escribe 'exit' para salir.")
    while True:
        q = input("Tú> ").strip()
        if q.lower() in ("exit", "quit", "salir"):
            break
        res = bot.ask(q)
        print("\nRespuesta:")
        print(res["answer"])
        if res.get("source_documents"):
            sources = set()
            for d in res["source_documents"]:
                src = d.metadata.get("source", "desconocido") if hasattr(d, "metadata") else "desconocido"
                sources.add(src)
            if sources:
                print("\n📎 Fuentes:")
                for src in sorted(sources):
                    print(f" - {src}")
        print("\n---\n")

@app.command()
def run(paths: list[str] = typer.Argument(None), collection: str = "study_collection", use_rag: bool = True, dry_run: bool = False):

    if paths:
        docs = ingest_files(paths, collection_name=collection, dry_run=dry_run)
        if dry_run:
            print(f"Dry-run: {len(docs)} chunks would be created/added from provided paths")
    else:
        if not os.path.exists(config.CHROMA_PERSIST_DIR):
            print("No existe base de datos y no se entregaron archivos. Ingresa archivos primero con 'ingest'.")
            raise typer.Exit(code=1)

    chat(use_rag=use_rag)


@app.command()
def delete(targets: list[str] = typer.Argument(..., help="Paths to source files (e.g. files/maze.pdf) or document ids to delete"), ids: str = typer.Option(None, help="Comma-separated document ids to delete")):

    vs = get_vectorstore()

    ids_to_delete = []

    if ids:
        for _id in ids.split(','):
            _id = _id.strip()
            if _id:
                ids_to_delete.append(_id)

    for t in targets:
        if os.path.sep not in t and len(t) > 15 and ids is None:
            ids_to_delete.append(t)
            continue
        base = os.path.basename(t)
        data = vs.get()
        for _id, md in zip(data.get('ids', []), data.get('metadatas', [])):
            if not md:
                continue
            if md.get('source') == base or md.get('source') == t:
                ids_to_delete.append(_id)

    if not ids_to_delete:
        print('No se encontraron documentos para eliminar con los targets/ids proporcionados.')
        raise typer.Exit()

    ids_to_delete = sorted(set(ids_to_delete))

    print(f'Se eliminarán {len(ids_to_delete)} documentos. Primeros IDs: {ids_to_delete[:5]}')
    if not typer.confirm('¿Confirmas la eliminación? Esto es irreversible'):
        print('Cancelado')
        raise typer.Exit()

    try:
        vs.delete(ids=ids_to_delete)
        logger.info(f'Eliminados {len(ids_to_delete)} documentos')
        print(f'Eliminados {len(ids_to_delete)} documentos.')
    except Exception as e:
        logger.exception(f'Error al eliminar documentos: {e}')
        print(f'Error al eliminar documentos: {e}')


@app.command("list")
def list_files(a: bool = typer.Option(False, "--all", "-a", help="Show first ids per source")):
    # Cliente persistente (API nueva de Chroma)
    try:
        client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)
    except Exception as e:
        print(f"Error creando cliente Chroma persistente: {e}")
        raise typer.Exit(code=1)

    try:
        collections = client.list_collections() or []
    except Exception as e:
        print(f"Error al listar colecciones: {e}")
        raise typer.Exit(code=1)

    if not collections:
        print('No hay colecciones en la base de datos.')
        raise typer.Exit()

    print('Colecciones en la base de datos:')
    for col in collections:
        name = getattr(col, 'name', None) or (col.get('name') if isinstance(col, dict) else 'desconocido')
        print(f"\n[ {name} ]")
        # Obtener datos de la colección específica directamente desde el cliente
        try:
            col_client = client.get_collection(name=name)
            data = col_client.get()
        except Exception as e:
            print(f"  Error al obtener datos de la colección {name}: {e}")
            print(' (vacía o inaccesible)')
            continue

        ids = data.get('ids', []) or []
        metadatas = data.get('metadatas', []) or []

        counts = {}
        samples = {}
        for _id, md in zip(ids, metadatas):
            if not md:
                continue
            src = md.get('source', 'desconocido')
            counts[src] = counts.get(src, 0) + 1
            samples.setdefault(src, []).append(_id)

        if not counts:
            print(' (vacía)')
            continue

        for src, cnt in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
            line = f" - {src}: {cnt} chunks"
            if a:
                s = samples.get(src, [])[:5]
                line += f" | sample ids: {s}"
            print(line)

if __name__ == "__main__":
    app()
