import json
import os
import re
import time
import uuid
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from typing import List, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_STARTED_AT = time.time()
APP_VERSION = os.getenv("PENNY_API_VERSION", "0.1.0")
PENNY_API_KEY = os.getenv("PENNY_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest")
MAX_QUERY_CHARS = int(os.getenv("MAX_QUERY_CHARS", "2500"))
DATA_PATH = Path(os.getenv("KNOWLEDGE_STORE_PATH", "./data/knowledge.json"))

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

app = FastAPI(title="Pipeline Penny API", version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class KnowledgeDoc(BaseModel):
    id: str
    title: str
    content: str
    source: Optional[str] = None


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=MAX_QUERY_CHARS)


class IngestDocRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    content: str = Field(..., min_length=1)
    source: Optional[str] = None


class IngestRequest(BaseModel):
    documents: List[IngestDocRequest]


class PruneRequest(BaseModel):
    include_source_prefixes: List[str] = Field(default_factory=list)
    exclude_source_prefixes: List[str] = Field(default_factory=list)
    dry_run: bool = False


def read_knowledge_store() -> List[KnowledgeDoc]:
    if not DATA_PATH.exists():
        return []
    try:
        raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        return [KnowledgeDoc(**row) for row in raw]
    except Exception:
        return []


def write_knowledge_store(rows: List[KnowledgeDoc]) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps([row.model_dump() for row in rows], indent=2), encoding="utf-8")


KNOWLEDGE = read_knowledge_store()

STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
    "what",
    "where",
    "when",
    "which",
    "about",
    "your",
    "their",
    "there",
    "please",
    "document",
    "summary",
    "summarize",
}


def doc_key(title: str, source: Optional[str]) -> str:
    return f"{title.strip().lower()}::{(source or '').strip().lower()}"


def normalize_prefixes(prefixes: List[str]) -> List[str]:
    return [prefix.strip() for prefix in prefixes if prefix and prefix.strip()]


def source_has_prefix(source: Optional[str], prefixes: List[str]) -> bool:
    if not prefixes:
        return False
    source_value = (source or "").strip()
    return any(source_value.startswith(prefix) for prefix in prefixes)


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", " ", text.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def tokenize_search_terms(text: str) -> List[str]:
    tokens = normalize_text(text).split()
    return [token for token in tokens if len(token) > 2 and token not in STOP_WORDS]


def extract_document_title_intent(query: str) -> Optional[str]:
    q = query.strip()
    patterns = [
        r"^\s*(?:please\s+)?summarize(?:\s+the)?\s+document\s*[:\-]\s*(.+)$",
        r"^\s*(?:please\s+)?summarize(?:\s+the)?\s+document\s+titled\s+(.+)$",
    ]
    for pattern in patterns:
        match = re.match(pattern, q, flags=re.IGNORECASE)
        if not match:
            continue
        title = match.group(1).strip().strip("\"'“”")
        if title:
            return title
    return None


def find_best_title_match(title_query: str) -> Optional[KnowledgeDoc]:
    target_norm = normalize_text(title_query)
    if not target_norm:
        return None

    target_tokens = set(tokenize_search_terms(title_query))
    best_doc: Optional[KnowledgeDoc] = None
    best_score = 0.0

    for doc in KNOWLEDGE:
        title_norm = normalize_text(doc.title)
        score = 0.0

        if title_norm == target_norm:
            return doc

        if target_norm in title_norm or title_norm in target_norm:
            score += 6.0

        similarity = SequenceMatcher(None, target_norm, title_norm).ratio()
        score += similarity * 4.0

        if target_tokens:
            doc_tokens = set(tokenize_search_terms(doc.title))
            overlap = len(target_tokens & doc_tokens) / len(target_tokens)
            score += overlap * 5.0

        if score > best_score:
            best_score = score
            best_doc = doc

    return best_doc if best_doc and best_score >= 5.0 else None


def infer_category(source: Optional[str]) -> str:
    if not source:
        return "General"
    first = source.split("/", 1)[0].strip()
    if not first:
        return "General"
    return first.replace("_", " ").replace("-", " ").strip() or "General"


def verify_api_key(x_penny_api_key: Optional[str]) -> None:
    if not PENNY_API_KEY:
        return
    if x_penny_api_key != PENNY_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


def search_docs(query: str, limit: int = 5) -> List[KnowledgeDoc]:
    title_intent = extract_document_title_intent(query)
    if title_intent:
        direct = find_best_title_match(title_intent)
        if direct:
            return [direct]

    normalized_query = normalize_text(title_intent or query)
    terms = tokenize_search_terms(title_intent or query)
    if not terms:
        return []

    scored = []
    for doc in KNOWLEDGE:
        title_lower = normalize_text(doc.title)
        content_lower = normalize_text(doc.content)

        # Title matches are weighted 10x to prevent content-frequency false positives
        title_score = sum(title_lower.count(term) * 12 for term in terms)
        content_score = sum(content_lower.count(term) for term in terms)
        phrase_bonus = 18 if normalized_query and normalized_query in title_lower else 0
        score = title_score + content_score + phrase_bonus

        if score > 0:
            scored.append((score, doc))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in scored[:limit]]


def build_fallback_answer(query: str, hits: List[KnowledgeDoc]) -> str:
    if not hits:
        return (
            "I could not find a confident answer in the current knowledge base. "
            "Try adding supporting documents through /ingest."
        )

    top = hits[0]
    preview = top.content[:380].strip()
    return f"Based on '{top.title}', here is the closest match for '{query}':\n\n{preview}"


async def build_anthropic_answer(query: str, hits: List[KnowledgeDoc]) -> str:
    if not ANTHROPIC_API_KEY:
        return build_fallback_answer(query, hits)

    context_blocks = []
    for doc in hits:
        context_blocks.append(f"TITLE: {doc.title}\nSOURCE: {doc.source or 'n/a'}\nCONTENT:\n{doc.content[:4000]}")

    context = "\n\n---\n\n".join(context_blocks) if context_blocks else "No matching docs were found."
    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": 2000,
        "system": (
            "You are Pipeline Penny, a business knowledge assistant for True North Data Strategies. "
            "Answer ONLY from the provided knowledge snippets. "
            "When answering, prioritize documents whose TITLE closely matches the user's question — "
            "do not pull answers from loosely related documents. "
            "Give complete, thorough answers — do not truncate or summarize prematurely. "
            "If the answer is not in the provided snippets, say clearly: "
            "'I don't have that information in the current knowledge base.'"
        ),
        "messages": [{"role": "user", "content": f"User question: {query}\n\nKnowledge:\n{context}"}],
    }

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            response = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

        parts = data.get("content", [])
        text_parts = [part.get("text", "") for part in parts if part.get("type") == "text"]
        answer = "\n".join(part.strip() for part in text_parts if part.strip())
        return answer or build_fallback_answer(query, hits)
    except Exception:
        return build_fallback_answer(query, hits)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": APP_VERSION,
        "uptime_seconds": round(time.time() - APP_STARTED_AT, 2),
        "knowledge_docs": len(KNOWLEDGE),
        "anthropic_configured": bool(ANTHROPIC_API_KEY),
        "api_key_required": bool(PENNY_API_KEY),
    }


@app.get("/status")
def status(x_penny_api_key: Optional[str] = Header(default=None)):
    verify_api_key(x_penny_api_key)
    return {
        "status": "ok",
        "knowledge_docs": len(KNOWLEDGE),
        "knowledge_store_path": str(DATA_PATH),
    }


@app.get("/catalog")
def catalog(
    x_penny_api_key: Optional[str] = Header(default=None),
    limit: int = 120,
):
    verify_api_key(x_penny_api_key)
    safe_limit = max(1, min(limit, 400))

    rows = []
    category_counts = defaultdict(int)
    for doc in KNOWLEDGE[:safe_limit]:
        category = infer_category(doc.source)
        category_counts[category] += 1
        rows.append(
            {
                "title": doc.title,
                "source": doc.source,
                "category": category,
            }
        )

    categories = [{"name": key, "count": category_counts[key]} for key in sorted(category_counts.keys())]
    return {
        "status": "ok",
        "knowledge_docs": len(KNOWLEDGE),
        "returned_docs": len(rows),
        "categories": categories,
        "documents": rows,
    }


@app.post("/ingest")
def ingest(
    payload: IngestRequest,
    x_penny_api_key: Optional[str] = Header(default=None),
    x_user_role: Optional[str] = Header(default=None),
):
    verify_api_key(x_penny_api_key)

    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    key_to_index = {doc_key(row.title, row.source): idx for idx, row in enumerate(KNOWLEDGE)}
    inserted = 0
    updated = 0

    for doc in payload.documents:
        title = doc.title.strip()
        content = doc.content.strip()
        source = doc.source.strip() if doc.source else None
        key = doc_key(title, source)

        existing_idx = key_to_index.get(key)
        if existing_idx is None:
            KNOWLEDGE.append(
                KnowledgeDoc(
                    id=str(uuid.uuid4()),
                    title=title,
                    content=content,
                    source=source,
                )
            )
            key_to_index[key] = len(KNOWLEDGE) - 1
            inserted += 1
        else:
            current = KNOWLEDGE[existing_idx]
            KNOWLEDGE[existing_idx] = KnowledgeDoc(
                id=current.id,
                title=title,
                content=content,
                source=source,
            )
            updated += 1

    write_knowledge_store(KNOWLEDGE)
    return {
        "status": "ok",
        "ingested": len(payload.documents),
        "inserted": inserted,
        "updated": updated,
        "knowledge_docs": len(KNOWLEDGE),
    }


@app.post("/admin/prune")
def prune_knowledge(
    payload: PruneRequest,
    x_penny_api_key: Optional[str] = Header(default=None),
    x_user_role: Optional[str] = Header(default=None),
):
    verify_api_key(x_penny_api_key)

    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    include_prefixes = normalize_prefixes(payload.include_source_prefixes)
    exclude_prefixes = normalize_prefixes(payload.exclude_source_prefixes)

    kept: List[KnowledgeDoc] = []
    removed: List[KnowledgeDoc] = []
    removed_by_category = defaultdict(int)

    for doc in KNOWLEDGE:
        source = (doc.source or "").strip()

        keep = True
        if include_prefixes and not source_has_prefix(source, include_prefixes):
            keep = False
        if keep and exclude_prefixes and source_has_prefix(source, exclude_prefixes):
            keep = False

        if keep:
            kept.append(doc)
        else:
            removed.append(doc)
            removed_by_category[infer_category(doc.source)] += 1

    if not payload.dry_run:
        KNOWLEDGE[:] = kept
        write_knowledge_store(KNOWLEDGE)

    return {
        "status": "ok",
        "dry_run": payload.dry_run,
        "before_count": len(KNOWLEDGE) if payload.dry_run else len(kept) + len(removed),
        "after_count": len(kept),
        "removed_count": len(removed),
        "include_source_prefixes": include_prefixes,
        "exclude_source_prefixes": exclude_prefixes,
        "removed_by_category": [
            {"name": key, "count": removed_by_category[key]} for key in sorted(removed_by_category.keys())
        ],
    }


@app.post("/query")
async def query(
    payload: QueryRequest,
    x_penny_api_key: Optional[str] = Header(default=None),
    x_user_id: Optional[str] = Header(default=None),
    x_user_role: Optional[str] = Header(default=None),
):
    verify_api_key(x_penny_api_key)
    query_text = payload.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query is required")

    hits = search_docs(query_text, limit=3)
    answer = await build_anthropic_answer(query_text, hits)

    return {
        "answer": answer,
        "sources": [doc.title for doc in hits],
        "query": query_text,
        "user_id": x_user_id,
        "user_role": x_user_role,
    }
