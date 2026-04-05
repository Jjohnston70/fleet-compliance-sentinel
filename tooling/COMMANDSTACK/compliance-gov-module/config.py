"""
Configuration module for the Compliance Government Module.

This module manages environment variables, paths, and provider settings for the
compliance platform, which aggregates and presents compliance-related content
for government contracting and regulatory requirements.

Environment Variables:
    COMPLIANCE_DATA_DIR: Base directory for compliance data (default: ./data)
    COMPLIANCE_CONTENT_DIR: Directory for original compliance content
    COMPLIANCE_TRACKER_DIR: Directory for implementation tracking files
    COMPLIANCE_LLM_PROVIDER: LLM provider ('anthropic' or 'openai', default: 'anthropic')
    COMPLIANCE_EMBEDDING_PROVIDER: Embedding provider ('openai', default: 'openai')
    COMPLIANCE_LOG_LEVEL: Logging level (default: 'INFO')
    ANTHROPIC_API_KEY: API key for Anthropic (required if using anthropic provider)
    OPENAI_API_KEY: API key for OpenAI (required if using openai embedding provider)
"""

import os
from pathlib import Path
from typing import Dict, Optional

# ============================================================================
# Application Metadata
# ============================================================================

APP_NAME = "compliance-gov-module"
APP_DESCRIPTION = (
    "Compliance Government Module - A comprehensive platform for managing and "
    "presenting compliance, security, and regulatory requirements for government "
    "contracting, data handling, and organizational governance."
)

# ============================================================================
# Directory Configuration
# ============================================================================

# Base data directory
DATA_DIR = Path(os.getenv("COMPLIANCE_DATA_DIR", "./data")).resolve()

# Content directory containing original compliance materials
CONTENT_DIR = DATA_DIR / "original_content"

# Tracker directory for implementation tracking JSON files
TRACKER_DIR = DATA_DIR / "tracker"

# Ensure required directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CONTENT_DIR.mkdir(parents=True, exist_ok=True)
TRACKER_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# Compliance Categories
# ============================================================================

# Mapping of skill directory names to display names
COMPLIANCE_CATEGORIES: Dict[str, str] = {
    "security-governance": "Security Governance",
    "internal-compliance": "Internal Compliance",
    "data-handling-privacy": "Data Handling & Privacy",
    "cloud-platform-security": "Cloud Platform Security",
    "business-operations": "Business Operations",
    "government-contracting": "Government Contracting",
    "contracts-risk-assurance": "Contracts & Risk Assurance",
    "compliance-audit": "Compliance Audit",
    "compliance-research": "Compliance Research",
    "compliance-usage": "Usage Guides",
}

# ============================================================================
# LLM Provider Configuration
# ============================================================================

LLM_PROVIDER = os.getenv("COMPLIANCE_LLM_PROVIDER", "anthropic").lower()
EMBEDDING_PROVIDER = os.getenv("COMPLIANCE_EMBEDDING_PROVIDER", "openai").lower()

# Supported providers
SUPPORTED_LLM_PROVIDERS = ("anthropic", "openai")
SUPPORTED_EMBEDDING_PROVIDERS = ("openai",)

# Validate LLM provider
if LLM_PROVIDER not in SUPPORTED_LLM_PROVIDERS:
    raise ValueError(
        f"Invalid LLM provider: {LLM_PROVIDER}. "
        f"Must be one of {SUPPORTED_LLM_PROVIDERS}"
    )

# Validate embedding provider
if EMBEDDING_PROVIDER not in SUPPORTED_EMBEDDING_PROVIDERS:
    raise ValueError(
        f"Invalid embedding provider: {EMBEDDING_PROVIDER}. "
        f"Must be one of {SUPPORTED_EMBEDDING_PROVIDERS}"
    )

# ============================================================================
# API Keys
# ============================================================================

# Anthropic API key (required for LLM if using anthropic provider)
ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")

# OpenAI API key (required for embeddings)
OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

# Validate required API keys
if LLM_PROVIDER == "anthropic" and not ANTHROPIC_API_KEY:
    raise ValueError(
        "ANTHROPIC_API_KEY environment variable is required "
        "when using anthropic as LLM provider"
    )

if EMBEDDING_PROVIDER == "openai" and not OPENAI_API_KEY:
    raise ValueError(
        "OPENAI_API_KEY environment variable is required "
        "when using openai as embedding provider"
    )

# ============================================================================
# Logging Configuration
# ============================================================================

LOG_LEVEL = os.getenv("COMPLIANCE_LOG_LEVEL", "INFO").upper()

# Supported log levels
SUPPORTED_LOG_LEVELS = ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")

if LOG_LEVEL not in SUPPORTED_LOG_LEVELS:
    raise ValueError(
        f"Invalid log level: {LOG_LEVEL}. "
        f"Must be one of {SUPPORTED_LOG_LEVELS}"
    )

# ============================================================================
# Provider Factory
# ============================================================================


def get_llm_provider() -> str:
    """
    Get the configured LLM provider.

    Returns:
        str: The LLM provider name ('anthropic' or 'openai')
    """
    return LLM_PROVIDER


def get_embedding_provider() -> str:
    """
    Get the configured embedding provider.

    Returns:
        str: The embedding provider name ('openai')
    """
    return EMBEDDING_PROVIDER


def get_api_key(provider: str) -> Optional[str]:
    """
    Get the API key for a specific provider.

    Args:
        provider (str): The provider name ('anthropic' or 'openai')

    Returns:
        Optional[str]: The API key if available, None otherwise

    Raises:
        ValueError: If the provider is not recognized
    """
    if provider == "anthropic":
        return ANTHROPIC_API_KEY
    elif provider == "openai":
        return OPENAI_API_KEY
    else:
        raise ValueError(f"Unknown provider: {provider}")


# ============================================================================
# Configuration Validation
# ============================================================================


def validate_configuration() -> None:
    """
    Validate the entire configuration at startup.

    Raises:
        ValueError: If any configuration is invalid or incomplete
    """
    errors = []

    # Validate directories are accessible
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
    except (OSError, PermissionError) as e:
        errors.append(f"Cannot access DATA_DIR ({DATA_DIR}): {e}")

    try:
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    except (OSError, PermissionError) as e:
        errors.append(f"Cannot access CONTENT_DIR ({CONTENT_DIR}): {e}")

    try:
        TRACKER_DIR.mkdir(parents=True, exist_ok=True)
    except (OSError, PermissionError) as e:
        errors.append(f"Cannot access TRACKER_DIR ({TRACKER_DIR}): {e}")

    # Validate providers
    if LLM_PROVIDER not in SUPPORTED_LLM_PROVIDERS:
        errors.append(
            f"Invalid LLM_PROVIDER: {LLM_PROVIDER}. "
            f"Must be one of {SUPPORTED_LLM_PROVIDERS}"
        )

    if EMBEDDING_PROVIDER not in SUPPORTED_EMBEDDING_PROVIDERS:
        errors.append(
            f"Invalid EMBEDDING_PROVIDER: {EMBEDDING_PROVIDER}. "
            f"Must be one of {SUPPORTED_EMBEDDING_PROVIDERS}"
        )

    # Validate API keys
    if LLM_PROVIDER == "anthropic" and not ANTHROPIC_API_KEY:
        errors.append("ANTHROPIC_API_KEY is required for anthropic LLM provider")

    if EMBEDDING_PROVIDER == "openai" and not OPENAI_API_KEY:
        errors.append("OPENAI_API_KEY is required for openai embedding provider")

    # Validate log level
    if LOG_LEVEL not in SUPPORTED_LOG_LEVELS:
        errors.append(
            f"Invalid LOG_LEVEL: {LOG_LEVEL}. "
            f"Must be one of {SUPPORTED_LOG_LEVELS}"
        )

    if errors:
        error_message = "Configuration validation failed:\n" + "\n".join(
            f"  - {error}" for error in errors
        )
        raise ValueError(error_message)


# ============================================================================
# Summary
# ============================================================================

if __name__ == "__main__":
    """Display configuration summary when run as a script."""
    print(f"Application: {APP_NAME}")
    print(f"Description: {APP_DESCRIPTION}\n")
    print("Directory Configuration:")
    print(f"  DATA_DIR: {DATA_DIR}")
    print(f"  CONTENT_DIR: {CONTENT_DIR}")
    print(f"  TRACKER_DIR: {TRACKER_DIR}\n")
    print("Provider Configuration:")
    print(f"  LLM Provider: {LLM_PROVIDER}")
    print(f"  Embedding Provider: {EMBEDDING_PROVIDER}")
    print(f"  Log Level: {LOG_LEVEL}\n")
    print("Compliance Categories:")
    for key, display_name in sorted(COMPLIANCE_CATEGORIES.items()):
        print(f"  {key}: {display_name}")
    print("\nRunning configuration validation...")
    try:
        validate_configuration()
        print("Configuration validation: OK")
    except ValueError as e:
        print(f"Configuration validation: FAILED\n{e}")
