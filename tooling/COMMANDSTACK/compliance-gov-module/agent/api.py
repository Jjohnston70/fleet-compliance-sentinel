"""
FastAPI backend for the Compliance Government Module.

Provides REST API endpoints for:
- Content browsing (categories, templates)
- RAG-powered compliance queries
- Multi-turn chat conversations
- Intake wizard for scoping compliance needs
- Implementation tracking and maturity scoring
"""

import logging
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import config
from .agent import get_agent, ComplianceRAGAgent

logger = logging.getLogger(__name__)


# ============================================================================
# Request/Response Models
# ============================================================================


class QueryRequest(BaseModel):
    """Request model for compliance query."""

    question: str = Field(..., description="The compliance question to answer")
    provider: str = Field(
        default="anthropic",
        description="LLM provider to use",
    )


class QueryResponse(BaseModel):
    """Response model for compliance query."""

    answer: str
    sources: List[Dict[str, str]]
    context_chunks_used: int


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    question: str = Field(..., description="The user's message")
    use_history: bool = Field(
        default=True,
        description="Include conversation history",
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    answer: str
    sources: List[Dict[str, str]]
    context_chunks_used: int
    conversation_turns: int


class IntakeRequest(BaseModel):
    """Request model for intake wizard."""

    business_size: str = Field(..., description="Business size category")
    handles_phi: bool = Field(default=False, description="Handles PHI/medical data")
    handles_pci: bool = Field(default=False, description="Handles payment card data")
    federal_contracts: bool = Field(default=False, description="Pursues federal contracts")
    cloud_platform: Optional[str] = Field(
        default=None,
        description="Primary cloud platform (aws, google, azure)",
    )
    existing_docs: bool = Field(default=False, description="Has existing compliance docs")
    frameworks_asked: List[str] = Field(
        default_factory=list,
        description="Frameworks user is interested in",
    )


class SkillRecommendation(BaseModel):
    """A recommended compliance skill with priority."""

    skill: str
    display_name: str
    priority: str
    reason: str
    template_count: int
    key_templates: List[str]


class IntakeResponse(BaseModel):
    """Response model for intake wizard."""

    recommendations: List[SkillRecommendation]
    total_templates: int


class TrackerUpdate(BaseModel):
    """Request model for tracker updates."""

    status: str = Field(
        ...,
        description="Template status",
    )
    evidence_link: str = Field(default="", description="Link to evidence")
    notes: str = Field(default="", description="Implementation notes")


class HealthResponse(BaseModel):
    """Response model for health check."""

    status: str
    app_name: str
    app_version: str
    llm_provider: str
    embedding_provider: str
    vector_store_loaded: bool


# ============================================================================
# FastAPI Application Setup
# ============================================================================


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title=config.APP_NAME,
        description=config.APP_DESCRIPTION,
        version="1.0.0",
    )

    # Configure CORS
    allow_origins = ["*"]  # Development - allow all
    if config.LOG_LEVEL == "PRODUCTION":
        allow_origins = ["https://localhost:3000"]  # Production - restrict

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global state for agent (lazy loaded)
    app.state.agent: Optional[ComplianceRAGAgent] = None
    app.state.categories_cache: Optional[Dict[str, Any]] = None

    return app


app = create_app()


# ============================================================================
# Helper Functions
# ============================================================================


def _load_template_metadata(template_path: Path) -> Dict[str, Any]:
    """
    Load metadata for a template from its _meta.json file.

    Args:
        template_path: Path to template file (with or without .md)

    Returns:
        Dictionary with template metadata
    """
    meta_path = template_path.with_suffix("_meta.json")

    if meta_path.exists():
        try:
            with open(meta_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load metadata for {template_path}: {e}")

    return {
        "title": template_path.stem,
        "template_id": template_path.stem,
        "skill": "unknown",
    }


def _build_categories_cache() -> Dict[str, Any]:
    """
    Build and cache the category structure with template counts.

    Returns:
        Dictionary mapping category slugs to metadata
    """
    categories_data = {}

    for category_slug, display_name in config.COMPLIANCE_CATEGORIES.items():
        category_dir = config.CONTENT_DIR / category_slug
        templates = []

        if category_dir.exists():
            for template_file in sorted(category_dir.glob("templates/*.md")):
                metadata = _load_template_metadata(template_file)
                templates.append({
                    "id": template_file.stem,
                    "title": metadata.get("title", template_file.stem),
                    "frameworks": metadata.get("frameworks", []),
                })

        categories_data[category_slug] = {
            "slug": category_slug,
            "display_name": display_name,
            "template_count": len(templates),
            "templates": templates,
        }

    return categories_data


def _get_categories_cache() -> Dict[str, Any]:
    """Get or build the categories cache."""
    if app.state.categories_cache is None:
        app.state.categories_cache = _build_categories_cache()
    return app.state.categories_cache


def _get_agent() -> ComplianceRAGAgent:
    """Get or initialize the global agent instance."""
    if app.state.agent is None:
        logger.info("Initializing compliance RAG agent...")
        app.state.agent = get_agent()
    return app.state.agent


def _calculate_maturity_score(tracker_data: Dict[str, Any]) -> float:
    """
    Calculate overall compliance maturity score (0-10).

    Args:
        tracker_data: Tracker data with template status information

    Returns:
        Maturity score between 0 and 10
    """
    governance_weights = {
        "ROOT": 3.0,
        "BASELINE": 2.5,
        "PLATFORM": 2.0,
        "CONTRACTUAL": 1.5,
        "SUPPORT": 1.0,
    }

    status_scores = {
        "not_started": 0.0,
        "in_progress": 0.25,
        "implemented": 0.75,
        "verified": 1.0,
    }

    total_weight = 0.0
    weighted_score = 0.0

    for template_data in tracker_data.get("templates", {}).values():
        status = template_data.get("status", "not_started")
        governance_level = template_data.get("governance_level", "SUPPORT")

        weight = governance_weights.get(governance_level, 1.0)
        score = status_scores.get(status, 0.0)

        weighted_score += weight * score
        total_weight += weight

    if total_weight == 0:
        return 0.0

    normalized_score = weighted_score / total_weight
    maturity_score = normalized_score * 10.0

    return round(maturity_score, 2)


# ============================================================================
# Core Endpoints
# ============================================================================


@app.on_event("startup")
async def startup_event():
    """Initialize agent on application startup."""
    try:
        logger.info("Application starting up...")
        agent = _get_agent()
        status = agent.get_status()
        logger.info(f"Agent initialized: {status}")
    except Exception as e:
        logger.error(f"Failed to initialize agent during startup: {e}")
        raise


@app.get("/", tags=["health"])
async def root():
    """Welcome endpoint."""
    return {
        "message": "Welcome to the Compliance Government Module API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Detailed health check endpoint."""
    try:
        agent = _get_agent()
        status = agent.get_status()

        return HealthResponse(
            status="healthy",
            app_name=config.APP_NAME,
            app_version="1.0.0",
            llm_provider=status["llm_provider"],
            embedding_provider=status["embedding_provider"],
            vector_store_loaded=status["vector_store_loaded"],
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")


# ============================================================================
# Content Endpoints
# ============================================================================


@app.get("/api/categories", tags=["content"])
async def get_categories():
    """Get all compliance categories with template counts."""
    try:
        cache = _get_categories_cache()
        return {
            "categories": [
                {
                    "slug": data["slug"],
                    "display_name": data["display_name"],
                    "template_count": data["template_count"],
                }
                for data in cache.values()
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories/{category_slug}", tags=["content"])
async def get_category(category_slug: str):
    """Get all templates in a specific category."""
    try:
        cache = _get_categories_cache()

        if category_slug not in cache:
            raise HTTPException(status_code=404, detail=f"Category not found: {category_slug}")

        category_data = cache[category_slug]

        return {
            "category": {
                "slug": category_data["slug"],
                "display_name": category_data["display_name"],
                "templates": category_data["templates"],
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching category {category_slug}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates/{category_slug}/{template_id}", tags=["content"])
async def get_template(category_slug: str, template_id: str):
    """Get a specific template with full content and metadata."""
    try:
        template_path = config.CONTENT_DIR / category_slug / "templates" / f"{template_id}.md"

        if not template_path.exists():
            raise HTTPException(status_code=404, detail=f"Template not found: {template_id}")

        with open(template_path, "r") as f:
            content = f.read()

        metadata = _load_template_metadata(template_path)

        return {
            "template": {
                "id": template_id,
                "category": category_slug,
                "content": content,
                "metadata": metadata,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching template {category_slug}/{template_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# RAG Endpoints
# ============================================================================


@app.post("/api/query", response_model=QueryResponse, tags=["rag"])
async def query(request: QueryRequest = Body(...)):
    """
    Query the compliance RAG system.

    Returns compliance guidance with source references.
    """
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        agent = _get_agent()
        result = agent.query(request.question)

        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            context_chunks_used=result["context_chunks_used"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse, tags=["rag"])
async def chat(request: ChatRequest = Body(...)):
    """
    Multi-turn chat endpoint with conversation history.

    Maintains context across multiple turns.
    """
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        agent = _get_agent()
        result = agent.chat(request.question, use_history=request.use_history)

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            context_chunks_used=result["context_chunks_used"],
            conversation_turns=result["conversation_turns"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Intake Wizard Endpoint
# ============================================================================


@app.post("/api/intake", response_model=IntakeResponse, tags=["intake"])
async def intake_wizard(request: IntakeRequest = Body(...)):
    """
    Intake wizard endpoint for scoping compliance needs.

    Analyzes business profile and recommends relevant skills.
    """
    try:
        recommendations = []
        categories_cache = _get_categories_cache()

        # Helper to add recommendation
        def add_skill(skill_slug: str, priority: str, reason: str):
            if skill_slug in categories_cache:
                data = categories_cache[skill_slug]
                # Get first 5 template IDs
                template_ids = [t["id"] for t in data["templates"][:5]]
                recommendations.append(
                    SkillRecommendation(
                        skill=skill_slug,
                        display_name=data["display_name"],
                        priority=priority,
                        reason=reason,
                        template_count=data["template_count"],
                        key_templates=template_ids,
                    )
                )

        # ALWAYS include root skills
        add_skill(
            "security-governance",
            "CRITICAL",
            "Foundation for all compliance programs",
        )
        add_skill(
            "internal-compliance",
            "CRITICAL",
            "Baseline security policies and procedures",
        )

        # Conditional skills based on business profile
        if request.handles_phi:
            add_skill(
                "data-handling-privacy",
                "HIGH",
                "HIPAA requirements for PHI/medical data",
            )
            add_skill(
                "contracts-risk-assurance",
                "HIGH",
                "HIPAA BAA requirements for data handling",
            )

        if request.handles_pci:
            add_skill(
                "data-handling-privacy",
                "HIGH",
                "PCI DSS compliance for payment data",
            )

        if request.federal_contracts:
            add_skill(
                "government-contracting",
                "HIGH",
                "Federal contract requirements and FAR compliance",
            )
            add_skill(
                "contracts-risk-assurance",
                "HIGH",
                "Risk management for federal contracts",
            )

        if request.cloud_platform == "google":
            add_skill(
                "cloud-platform-security",
                "MEDIUM",
                "Google Cloud-specific security controls",
            )
        elif request.cloud_platform == "aws":
            add_skill(
                "cloud-platform-security",
                "MEDIUM",
                "AWS-specific security controls",
            )
        elif request.cloud_platform == "azure":
            add_skill(
                "cloud-platform-security",
                "MEDIUM",
                "Azure-specific security controls",
            )

        # Frameworks-based recommendations
        for framework in request.frameworks_asked:
            if framework.lower() == "nist":
                add_skill(
                    "government-contracting",
                    "HIGH",
                    "NIST framework for federal compliance",
                )
                add_skill(
                    "compliance-research",
                    "MEDIUM",
                    "NIST compliance research and standards",
                )
            elif framework.lower() == "hipaa":
                add_skill(
                    "data-handling-privacy",
                    "HIGH",
                    "HIPAA privacy and security rules",
                )
                add_skill(
                    "contracts-risk-assurance",
                    "HIGH",
                    "HIPAA BAA and risk assessment",
                )
            elif framework.lower() in ("soc2", "iso27001"):
                add_skill(
                    "compliance-audit",
                    "HIGH",
                    f"{framework.upper()} audit and certification requirements",
                )
            elif framework.lower() in ("fedramp", "cmmc"):
                add_skill(
                    "government-contracting",
                    "CRITICAL",
                    f"{framework.upper()} federal requirements",
                )
                add_skill(
                    "cloud-platform-security",
                    "HIGH",
                    f"{framework.upper()} cloud security controls",
                )

        # Always include support skills
        add_skill(
            "business-operations",
            "MEDIUM",
            "Operational procedures and business continuity",
        )
        add_skill(
            "compliance-usage",
            "LOW",
            "Guides for using compliance templates and tools",
        )

        # Remove duplicates (keep highest priority)
        seen_skills = {}
        priority_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}

        for rec in recommendations:
            if rec.skill not in seen_skills:
                seen_skills[rec.skill] = rec
            else:
                existing = seen_skills[rec.skill]
                if priority_order.get(rec.priority, 0) > priority_order.get(existing.priority, 0):
                    seen_skills[rec.skill] = rec

        final_recommendations = sorted(
            seen_skills.values(),
            key=lambda x: (priority_order.get(x.priority, 0), x.display_name),
            reverse=True,
        )

        # Calculate total templates
        total_templates = sum(r.template_count for r in final_recommendations)

        return IntakeResponse(
            recommendations=final_recommendations,
            total_templates=total_templates,
        )

    except Exception as e:
        logger.error(f"Error in intake wizard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Tracker Endpoints
# ============================================================================


@app.get("/api/tracker/{client_id}", tags=["tracker"])
async def get_tracker(client_id: str):
    """Get implementation tracker for a client."""
    try:
        tracker_path = config.TRACKER_DIR / f"{client_id}.json"

        if not tracker_path.exists():
            raise HTTPException(status_code=404, detail=f"Tracker not found for client: {client_id}")

        with open(tracker_path, "r") as f:
            tracker_data = json.load(f)

        return tracker_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching tracker for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tracker/{client_id}", tags=["tracker"])
async def create_tracker(client_id: str, recommendations: IntakeResponse = Body(...)):
    """Create new tracker from intake recommendations."""
    try:
        tracker_data = {
            "client_id": client_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "templates": {},
        }

        # Create template entries from recommendations
        for rec in recommendations.recommendations:
            for template_id in rec.key_templates:
                tracker_data["templates"][template_id] = {
                    "skill": rec.skill,
                    "template_id": template_id,
                    "status": "not_started",
                    "evidence_link": "",
                    "notes": "",
                    "governance_level": rec.priority,
                }

        # Save tracker
        tracker_path = config.TRACKER_DIR / f"{client_id}.json"
        with open(tracker_path, "w") as f:
            json.dump(tracker_data, f, indent=2)

        logger.info(f"Created tracker for client {client_id} with {len(tracker_data['templates'])} templates")

        return tracker_data

    except Exception as e:
        logger.error(f"Error creating tracker for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/tracker/{client_id}/template/{template_id}", tags=["tracker"])
async def update_template_status(
    client_id: str,
    template_id: str,
    update: TrackerUpdate = Body(...),
):
    """Update status of a template in tracker."""
    try:
        tracker_path = config.TRACKER_DIR / f"{client_id}.json"

        if not tracker_path.exists():
            raise HTTPException(status_code=404, detail=f"Tracker not found for client: {client_id}")

        with open(tracker_path, "r") as f:
            tracker_data = json.load(f)

        if template_id not in tracker_data["templates"]:
            raise HTTPException(status_code=404, detail=f"Template not found: {template_id}")

        # Update template
        tracker_data["templates"][template_id]["status"] = update.status
        tracker_data["templates"][template_id]["evidence_link"] = update.evidence_link
        tracker_data["templates"][template_id]["notes"] = update.notes
        tracker_data["updated_at"] = datetime.utcnow().isoformat()

        # Save updated tracker
        with open(tracker_path, "w") as f:
            json.dump(tracker_data, f, indent=2)

        logger.info(f"Updated template {template_id} in tracker {client_id}")

        return tracker_data["templates"][template_id]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tracker: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tracker/{client_id}/score", tags=["tracker"])
async def get_maturity_score(client_id: str):
    """Get compliance maturity score for client."""
    try:
        tracker_path = config.TRACKER_DIR / f"{client_id}.json"

        if not tracker_path.exists():
            raise HTTPException(status_code=404, detail=f"Tracker not found for client: {client_id}")

        with open(tracker_path, "r") as f:
            tracker_data = json.load(f)

        score = _calculate_maturity_score(tracker_data)

        return {
            "client_id": client_id,
            "maturity_score": score,
            "scale": "0-10",
            "templates_tracked": len(tracker_data["templates"]),
            "last_updated": tracker_data.get("updated_at"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating maturity score for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
