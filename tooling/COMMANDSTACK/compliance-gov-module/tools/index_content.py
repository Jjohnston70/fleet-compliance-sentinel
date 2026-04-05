import logging
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
except ImportError:
    print("Required packages not found. Please install them using:")
    print("pip install langchain faiss-cpu langchain-community langchain-text-splitters")
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config
from providers.factory import get_embedding_provider
from providers.langchain_adapter import ProviderEmbeddings


logger = logging.getLogger(__name__)


def collect_markdown_files(content_dir: Path) -> List[Path]:
    """
    Recursively collect all markdown files from content directory.
    Excludes files ending with _meta.md or _meta.json.

    Args:
        content_dir: Root directory to search

    Returns:
        List of Path objects for markdown files
    """
    md_files = []
    for md_file in content_dir.rglob("*.md"):
        if "_meta" not in md_file.name:
            md_files.append(md_file)
    return sorted(md_files)


def load_file_metadata(md_file: Path) -> Dict:
    """
    Load metadata from companion _meta.json file if it exists.

    Args:
        md_file: Path to markdown file

    Returns:
        Dictionary of metadata or empty dict if no metadata file exists
    """
    meta_file = md_file.with_stem(md_file.stem + "_meta")
    if meta_file.with_suffix(".json").exists():
        try:
            meta_path = meta_file.with_suffix(".json")
            return json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning(f"Failed to load metadata from {meta_file}: {e}")
    return {}


def extract_skill_and_template(md_file: Path, content_dir: Path) -> Tuple[str, str]:
    """
    Extract skill directory and template name from file path.

    Example: data/original_content/security-governance/nist-csf/index.md
    Returns: ("security-governance", "nist-csf")

    Args:
        md_file: Path to markdown file
        content_dir: Root content directory

    Returns:
        Tuple of (skill, template) or ("unknown", "unknown")
    """
    try:
        relative_path = md_file.relative_to(content_dir)
        parts = relative_path.parts
        if len(parts) >= 2:
            return parts[0], parts[1]
    except ValueError:
        pass
    return "unknown", "unknown"


def index_original_content(
    content_dir: Path,
    output_dir: Path,
) -> None:
    """
    Index original compliance content for RAG.

    Walks data/original_content/ for all .md files, loads companion _meta.json,
    splits using RecursiveCharacterTextSplitter, generates embeddings, and
    creates FAISS vector store.

    Args:
        content_dir: Directory containing original content (markdown files)
        output_dir: Directory to save the vector store

    Raises:
        FileNotFoundError: If content_dir does not exist
        Exception: If embedding provider initialization fails
    """
    content_dir = Path(content_dir)
    output_dir = Path(output_dir)

    if not content_dir.exists():
        raise FileNotFoundError(f"Content directory not found: {content_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*70}")
    print(f"Compliance Content Indexing Pipeline")
    print(f"{'='*70}")
    print(f"Source: {content_dir}")
    print(f"Output: {output_dir}\n")

    # Collect all markdown files
    md_files = collect_markdown_files(content_dir)
    if not md_files:
        print("ERROR: No markdown files found to index.")
        sys.exit(1)

    print(f"Found {len(md_files)} markdown files.\n")

    # Initialize text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    # Initialize embeddings provider
    try:
        embedding_provider = get_embedding_provider(
            Config.EMBEDDING_PROVIDER,
            **Config.get_embedding_config()
        )
        embeddings = ProviderEmbeddings(embedding_provider)
        logger.info(
            f"Initialized {Config.EMBEDDING_PROVIDER} embedding provider"
        )
    except Exception as e:
        logger.error(f"Failed to initialize embedding provider: {e}")
        raise

    # Process all markdown files
    documents = []
    skills_processed = defaultdict(int)
    templates_processed = defaultdict(int)
    total_files = len(md_files)

    for idx, md_file in enumerate(md_files, 1):
        try:
            skill, template = extract_skill_and_template(md_file, content_dir)

            # Print progress
            print(f"Indexing {skill}/{template}... ({idx}/{total_files})")

            # Load content
            content = md_file.read_text(encoding="utf-8")
            if not content.strip():
                logger.warning(f"Skipping empty file: {md_file}")
                continue

            # Load metadata
            metadata = load_file_metadata(md_file)
            metadata.update({
                "source_file": str(md_file.relative_to(content_dir)),
                "skill": skill,
                "template_id": template,
                "title": metadata.get("title", template),
                "category": skill,
                "frameworks": metadata.get("frameworks", [])
            })

            # Split text into chunks
            chunks = text_splitter.split_text(content)

            # Add chunks to documents
            for chunk_id, chunk in enumerate(chunks):
                documents.append({
                    "content": chunk,
                    "metadata": {
                        **metadata,
                        "chunk_id": chunk_id,
                        "chunk_count": len(chunks)
                    }
                })

            skills_processed[skill] += 1
            templates_processed[template] += 1

        except Exception as e:
            logger.error(f"Error processing {md_file}: {e}")
            continue

    if not documents:
        print("\nERROR: No documents processed for indexing.")
        sys.exit(1)

    print(f"\nProcessing complete. Creating vector store...")
    print(f"Total chunks: {len(documents)}")
    print(f"Total templates: {sum(templates_processed.values())}")
    print(f"Total skills: {len(skills_processed)}\n")

    # Create vector store
    texts = [doc["content"] for doc in documents]
    metadatas = [doc["metadata"] for doc in documents]

    try:
        vector_store = FAISS.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas
        )

        # Save vector store
        vector_store.save_local(str(output_dir))

        # Print summary
        print(f"{'='*70}")
        print(f"Indexing Summary")
        print(f"{'='*70}")
        print(f"Total chunks indexed: {len(documents)}")
        print(f"Total templates: {sum(templates_processed.values())}")
        print(f"Skills processed:")
        for skill in sorted(skills_processed.keys()):
            print(f"  - {skill}: {skills_processed[skill]} templates")
        print(f"Index size on disk: {sum(f.stat().st_size for f in output_dir.rglob('*') if f.is_file()) / 1024 / 1024:.2f} MB")
        print(f"Vector store saved to: {output_dir}")
        print(f"{'='*70}\n")

    except Exception as e:
        logger.error(f"Failed to create vector store: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    try:
        content_dir = Config.CONTENT_DIR
        output_dir = Config.VECTOR_STORE_DIR

        index_original_content(content_dir, output_dir)

    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        sys.exit(1)