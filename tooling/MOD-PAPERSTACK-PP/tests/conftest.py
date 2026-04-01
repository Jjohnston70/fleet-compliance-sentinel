"""
Pytest configuration and fixtures for invoice extraction tests.
"""

import os
import pytest


@pytest.fixture
def samples_dir():
    """
    Fixture that returns the path to the invoice-samples directory.
    Works relative to the project root.
    """
    # Get the project root (two levels up from tests directory)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    samples_path = os.path.join(project_root, "invoice-samples")
    
    if not os.path.exists(samples_path):
        pytest.skip(f"Samples directory not found: {samples_path}")
    
    return samples_path
