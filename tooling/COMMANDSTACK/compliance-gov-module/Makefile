# Compliance Government Module - Developer Commands
# Makefile for common development tasks

.PHONY: help install index dev-api dev-frontend dev test clean docker-up docker-down docker-build

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# ============================================================================
# Help
# ============================================================================

help:
	@echo "$(BLUE)Compliance Government Module - Developer Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Installation & Setup:$(NC)"
	@echo "  make install              Install all dependencies (Python + Node.js)"
	@echo "  make index                Index compliance content (create vector store)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev-api              Start FastAPI backend with auto-reload"
	@echo "  make dev-frontend         Start Next.js frontend dev server"
	@echo "  make dev                  Start both backend and frontend (parallel)"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test                 Run pytest on all tests"
	@echo "  make test-coverage        Run tests with coverage report"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build         Build Docker images (api + frontend)"
	@echo "  make docker-up            Start all services with docker-compose"
	@echo "  make docker-down          Stop and remove all containers"
	@echo "  make docker-logs          Follow container logs"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean                Remove generated files and caches"
	@echo "  make lint                 Run code quality checks"
	@echo ""

# ============================================================================
# Installation & Setup
# ============================================================================

install:
	@echo "$(YELLOW)Installing Python dependencies...$(NC)"
	pip install -r requirements.txt
	@echo "$(YELLOW)Installing Node.js dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Installation complete!$(NC)"

index:
	@echo "$(YELLOW)Building vector store from compliance content...$(NC)"
	python tools/index_content.py
	@echo "$(GREEN)Indexing complete!$(NC)"

# ============================================================================
# Development
# ============================================================================

dev-api:
	@echo "$(YELLOW)Starting FastAPI backend (port 8000)...$(NC)"
	uvicorn agent.api:app --reload --port 8000

dev-frontend:
	@echo "$(YELLOW)Starting Next.js frontend (port 3000)...$(NC)"
	cd frontend && npm run dev

dev:
	@echo "$(YELLOW)Starting both backend and frontend...$(NC)"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	make dev-api & make dev-frontend

# ============================================================================
# Testing
# ============================================================================

test:
	@echo "$(YELLOW)Running tests...$(NC)"
	pytest tests/ -v

test-coverage:
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	pytest tests/ -v --cov=agent --cov=providers --cov-report=html
	@echo "$(GREEN)Coverage report: htmlcov/index.html$(NC)"

# ============================================================================
# Docker
# ============================================================================

docker-build:
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker build -t compliance-gov-api:latest -f Dockerfile .
	docker build -t compliance-gov-frontend:latest -f Dockerfile.frontend .
	@echo "$(GREEN)Docker images built successfully!$(NC)"

docker-up:
	@echo "$(YELLOW)Starting Docker Compose services...$(NC)"
	docker-compose up --build
	@echo "$(GREEN)Services running:$(NC)"
	@echo "  API: http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"

docker-down:
	@echo "$(YELLOW)Stopping Docker Compose services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Services stopped$(NC)"

docker-logs:
	@echo "$(YELLOW)Following Docker logs...$(NC)"
	docker-compose logs -f

# ============================================================================
# Maintenance
# ============================================================================

clean:
	@echo "$(YELLOW)Cleaning up generated files...$(NC)"
	rm -rf data/vector_store/*
	rm -rf data/tracker/*
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".pytest_cache" -delete
	cd frontend && rm -rf .next out dist 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete!$(NC)"

lint:
	@echo "$(YELLOW)Running code quality checks...$(NC)"
	python -m pylint agent/ providers/ tools/ --disable=all --enable=E,F 2>/dev/null || echo "Pylint not installed, skipping"
	cd frontend && npm run lint 2>/dev/null || echo "Frontend linting not configured"
	@echo "$(GREEN)Linting complete!$(NC)"

# ============================================================================
# Deployment
# ============================================================================

deploy-gcp:
	@echo "$(YELLOW)Deploying to Google Cloud Run...$(NC)"
	bash deploy/cloud-run-deploy.sh

deploy-vercel:
	@echo "$(YELLOW)Deploying frontend to Vercel...$(NC)"
	cd frontend && vercel --prod

# ============================================================================
# Utility
# ============================================================================

config-check:
	@echo "$(YELLOW)Checking configuration...$(NC)"
	python config.py
	@echo "$(GREEN)Configuration check complete!$(NC)"

status:
	@echo "$(BLUE)Project Status$(NC)"
	@echo ""
	@echo "Backend:"
	@echo "  - Python environment: $$(python --version)"
	@echo "  - FastAPI: $$(pip show fastapi | grep Version | cut -d' ' -f2)"
	@echo ""
	@echo "Frontend:"
	@echo "  - Node.js: $$(node --version)"
	@echo "  - npm: $$(npm --version)"
	@echo "  - Next.js: $$(cd frontend && npm list next | head -2 | tail -1)"
	@echo ""
