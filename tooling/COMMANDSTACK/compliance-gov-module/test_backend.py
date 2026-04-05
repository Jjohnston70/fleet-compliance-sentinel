#!/usr/bin/env python3
"""
Integration test script for the compliance-gov-module backend.

Tests all major components and endpoints to verify the backend is working correctly.
"""

import sys
import json
from pathlib import Path

# Test configuration
def test_config():
    """Test configuration module."""
    print("Testing configuration...")
    try:
        import config

        assert config.APP_NAME == "compliance-gov-module"
        assert config.COMPLIANCE_CATEGORIES
        assert len(config.COMPLIANCE_CATEGORIES) == 10
        assert config.LLM_PROVIDER in ("anthropic", "openai")
        assert config.EMBEDDING_PROVIDER == "openai"
        assert config.CONTENT_DIR.exists()

        print("✓ Configuration loaded successfully")
        print(f"  - LLM Provider: {config.LLM_PROVIDER}")
        print(f"  - Embedding Provider: {config.EMBEDDING_PROVIDER}")
        print(f"  - Categories: {len(config.COMPLIANCE_CATEGORIES)}")
        return True
    except Exception as e:
        print(f"✗ Configuration test failed: {e}")
        return False


# Test providers
def test_providers():
    """Test provider initialization."""
    print("\nTesting providers...")
    try:
        from providers.factory import get_llm_provider, get_embedding_provider
        import config

        # Test LLM provider
        llm = get_llm_provider(config.LLM_PROVIDER)
        assert llm is not None
        print(f"✓ LLM provider initialized: {config.LLM_PROVIDER}")

        # Test embedding provider
        embeddings = get_embedding_provider(config.EMBEDDING_PROVIDER)
        assert embeddings is not None
        print(f"✓ Embedding provider initialized: {config.EMBEDDING_PROVIDER}")

        return True
    except Exception as e:
        print(f"✗ Provider test failed: {e}")
        return False


# Test agent initialization
def test_agent():
    """Test ComplianceRAGAgent initialization."""
    print("\nTesting agent initialization...")
    try:
        from agent.agent import ComplianceRAGAgent

        print("  Initializing ComplianceRAGAgent...")
        print("  Loading documents...")
        agent = ComplianceRAGAgent()

        status = agent.get_status()
        assert status["status"] == "ready"
        assert status["vector_store_loaded"]

        print(f"✓ Agent initialized successfully")
        print(f"  - Status: {status['status']}")
        print(f"  - Vector store: Loaded")
        print(f"  - LLM Provider: {status['llm_provider']}")
        print(f"  - Embedding Provider: {status['embedding_provider']}")

        return True
    except Exception as e:
        print(f"✗ Agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test FastAPI application
def test_fastapi():
    """Test FastAPI application initialization."""
    print("\nTesting FastAPI application...")
    try:
        from agent.api import app
        from fastapi.testclient import TestClient

        client = TestClient(app)

        # Test root endpoint
        response = client.get("/")
        assert response.status_code == 200
        assert "docs" in response.json()
        print("✓ Root endpoint working")

        # Test health endpoint
        response = client.get("/health")
        assert response.status_code == 200
        health = response.json()
        assert health["status"] == "healthy"
        print("✓ Health endpoint working")

        # Test categories endpoint
        response = client.get("/api/categories")
        assert response.status_code == 200
        categories = response.json()
        assert "categories" in categories
        assert len(categories["categories"]) == 10
        print(f"✓ Categories endpoint working ({len(categories['categories'])} categories)")

        return True
    except Exception as e:
        print(f"✗ FastAPI test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test content loading
def test_content():
    """Test content loading from directory."""
    print("\nTesting content loading...")
    try:
        import config

        # Count markdown files
        md_files = list(config.CONTENT_DIR.rglob("*.md"))
        assert len(md_files) > 0
        print(f"✓ Found {len(md_files)} markdown files")

        # Check key categories exist
        for category_slug in config.COMPLIANCE_CATEGORIES.keys():
            category_dir = config.CONTENT_DIR / category_slug
            if category_dir.exists():
                templates = list(category_dir.glob("templates/*.md"))
                if templates:
                    print(f"  - {category_slug}: {len(templates)} templates")

        return True
    except Exception as e:
        print(f"✗ Content test failed: {e}")
        return False


# Test intake wizard logic
def test_intake():
    """Test intake wizard endpoint."""
    print("\nTesting intake wizard...")
    try:
        from agent.api import app
        from fastapi.testclient import TestClient

        client = TestClient(app)

        # Test with various inputs
        intake_data = {
            "business_size": "5-20",
            "handles_phi": True,
            "handles_pci": False,
            "federal_contracts": True,
            "cloud_platform": "google",
            "existing_docs": False,
            "frameworks_asked": ["nist", "hipaa"]
        }

        response = client.post("/api/intake", json=intake_data)
        assert response.status_code == 200

        result = response.json()
        assert "recommendations" in result
        assert len(result["recommendations"]) > 0

        # Check for expected skills
        skill_names = {r["skill"] for r in result["recommendations"]}
        assert "security-governance" in skill_names  # Root
        assert "internal-compliance" in skill_names  # Baseline
        assert "data-handling-privacy" in skill_names  # PHI
        assert "government-contracting" in skill_names  # Federal

        print(f"✓ Intake wizard working")
        print(f"  - Received {len(result['recommendations'])} recommendations")
        print(f"  - Total templates: {result['total_templates']}")

        return True
    except Exception as e:
        print(f"✗ Intake wizard test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test tracker endpoints
def test_tracker():
    """Test tracker endpoints."""
    print("\nTesting tracker endpoints...")
    try:
        from agent.api import app
        from fastapi.testclient import TestClient

        client = TestClient(app)

        # First get intake recommendations
        intake_data = {
            "business_size": "5-20",
            "handles_phi": False,
            "handles_pci": False,
            "federal_contracts": False,
            "cloud_platform": None,
            "existing_docs": False,
            "frameworks_asked": []
        }

        response = client.post("/api/intake", json=intake_data)
        assert response.status_code == 200
        recommendations = response.json()

        # Create tracker
        test_client_id = "test-client-001"
        response = client.post(f"/api/tracker/{test_client_id}", json=recommendations)
        assert response.status_code == 200
        tracker = response.json()
        assert tracker["client_id"] == test_client_id
        print(f"✓ Tracker created with {len(tracker['templates'])} templates")

        # Get tracker
        response = client.get(f"/api/tracker/{test_client_id}")
        assert response.status_code == 200
        print("✓ Tracker retrieval working")

        # Update template status
        template_ids = list(tracker["templates"].keys())
        if template_ids:
            template_id = template_ids[0]
            response = client.put(
                f"/api/tracker/{test_client_id}/template/{template_id}",
                json={
                    "status": "implemented",
                    "evidence_link": "https://example.com",
                    "notes": "Test implementation"
                }
            )
            assert response.status_code == 200
            print("✓ Template status update working")

        # Get maturity score
        response = client.get(f"/api/tracker/{test_client_id}/score")
        assert response.status_code == 200
        score_data = response.json()
        assert "maturity_score" in score_data
        print(f"✓ Maturity score: {score_data['maturity_score']}/10")

        return True
    except Exception as e:
        print(f"✗ Tracker test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 80)
    print("COMPLIANCE GOVERNMENT MODULE - Backend Integration Tests")
    print("=" * 80)

    tests = [
        ("Configuration", test_config),
        ("Providers", test_providers),
        ("Content", test_content),
        ("Agent", test_agent),
        ("FastAPI", test_fastapi),
        ("Intake Wizard", test_intake),
        ("Tracker", test_tracker),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n✗ {test_name} test crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    passed = sum(1 for _, p in results if p)
    total = len(results)

    for test_name, passed_flag in results:
        status = "✓ PASS" if passed_flag else "✗ FAIL"
        print(f"{status:8} - {test_name}")

    print("=" * 80)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("\n✓ All backend tests passed! Backend is ready for use.")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please review errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
