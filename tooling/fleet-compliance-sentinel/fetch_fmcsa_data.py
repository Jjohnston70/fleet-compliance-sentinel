# fetch_fmcsa_data.py
"""
FMCSA data fetcher using the official API documentation
This version uses webKey as a query parameter instead of header authentication
"""

import requests
import pandas as pd
import streamlit as st
import logging
import os
import re
from datetime import datetime
from typing import Optional, Dict, Any
from app_config import get_api_headers, APP_NAME
from rate_limiter import FMCSA_RATE_LIMITER

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FMCSADataFetcher:
    def __init__(self):
        # Get API key (webKey) from environment or Streamlit secrets
        self.web_key = self._get_web_key()
        self.base_url = "https://mobile.fmcsa.dot.gov/qc/services/carriers"
        
    def _get_web_key(self):
        """Get FMCSA webKey from environment variables or Streamlit secrets"""
        # Try to get from Streamlit secrets first (for production)
        try:
            if hasattr(st, 'secrets') and 'fmcsa' in st.secrets:
                return st.secrets["fmcsa"]["api_key"]  # Using 'api_key' field for webKey
        except Exception as e:
            logger.warning(f"Could not load FMCSA webKey from Streamlit secrets: {e}")
        
        # Fall back to environment variables (for development)
        web_key = os.environ.get("FMCSA_API_KEY") or os.environ.get("FMCSA_WEB_KEY")
        
        if not web_key:
            logger.error("FMCSA webKey not found. Please add it to .streamlit/secrets.toml or as an environment variable.")
            st.error("FMCSA API key not found. Safety data cannot be fetched.")
            raise ValueError("FMCSA webKey is required")
        
        return web_key
    
    def validate_dot_number(self, dot_number: str) -> str:
        """
        Validate and clean DOT number
        
        Args:
            dot_number: The DOT number to validate
            
        Returns:
            Cleaned DOT number
            
        Raises:
            ValueError: If DOT number is invalid
        """
        if not dot_number:
            raise ValueError("DOT number is required")
        
        # Clean DOT number (remove any non-numeric characters)
        cleaned_dot = ''.join(filter(str.isdigit, str(dot_number)))
        
        # Validate DOT number format (should be numeric and 5-8 digits)
        if not cleaned_dot or not re.match(r'^\d{5,8}$', cleaned_dot):
            raise ValueError(f"Invalid DOT number format: {dot_number}. DOT numbers should be 5-8 digits.")
        
        return cleaned_dot
    
    def fetch_company_safety_data(self, dot_number: str) -> pd.DataFrame:
        """
        Fetch company safety data from FMCSA API using DOT number
        
        Args:
            dot_number: The DOT number to look up
            
        Returns:
            DataFrame with safety data
        """
        if not self.web_key:
            raise ValueError("FMCSA webKey is required")
        
        try:
            # Validate DOT number
            dot_number = self.validate_dot_number(dot_number)
            
            # Build URL with DOT number endpoint
            url = f"{self.base_url}/{dot_number}"
            
            # Add webKey as query parameter (as per documentation)
            params = {
                'webKey': self.web_key
            }
            
            # Use app headers for identification
            headers = get_api_headers('fmcsa')
            
            logger.info(f"Fetching FMCSA data for DOT: {dot_number}")
            
            # Use rate limiter to avoid hitting API limits
            with FMCSA_RATE_LIMITER:
                response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if we got valid data
                if 'content' in data and 'carrier' in data.get('content', {}):
                    safety_data = self._process_safety_data(data)
                    logger.info(f"Successfully fetched data for DOT: {dot_number}")
                    return safety_data
                else:
                    logger.warning("API returned unexpected data structure")
                    raise ValueError("API returned unexpected data structure")
                    
            elif response.status_code == 401:
                logger.error("Unauthorized: Invalid or missing webKey")
                st.error("FMCSA API authentication failed. Please check your API key.")
                raise ValueError("FMCSA API authentication failed")
            elif response.status_code == 404:
                logger.warning(f"DOT number {dot_number} not found")
                return pd.DataFrame([{
                    "Error": f"DOT number {dot_number} not found",
                    "Last Updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }])
            else:
                logger.error(f"API request failed with status code: {response.status_code}")
                logger.error(f"Response: {response.text}")
                response.raise_for_status()
        
        except requests.exceptions.Timeout:
            logger.error("FMCSA API request timed out")
            st.error("FMCSA API request timed out. Please try again later.")
            raise TimeoutError("FMCSA API request timed out")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request exception: {e}")
            st.error(f"Error connecting to FMCSA API: {e}")
            raise e
        except ValueError as e:
            logger.error(f"Value error: {e}")
            st.error(str(e))
            raise e
        except Exception as e:
            logger.error(f"Unexpected error fetching FMCSA data: {e}")
            st.error(f"Error fetching FMCSA data: {e}")
            raise e
    
    def fetch_company_basics(self, dot_number: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed BASIC scores for a company
        
        Args:
            dot_number: The DOT number to look up
            
        Returns:
            Dictionary with BASIC scores
        """
        if not self.web_key:
            raise ValueError("FMCSA webKey is required")
        
        try:
            # Validate DOT number
            dot_number = self.validate_dot_number(dot_number)
            
            # Use the basics endpoint
            url = f"{self.base_url}/{dot_number}/basics"
            params = {'webKey': self.web_key}
            headers = get_api_headers('fmcsa')
            
            # Use rate limiter to avoid hitting API limits
            with FMCSA_RATE_LIMITER:
                response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch BASIC scores: {response.status_code}")
                if response.status_code == 404:
                    logger.warning(f"No BASIC scores found for DOT number {dot_number}")
                    return None
                response.raise_for_status()
                
        except Exception as e:
            logger.error(f"Error fetching BASIC scores: {e}")
            return None
    
    def _process_safety_data(self, data: Dict[str, Any]) -> pd.DataFrame:
        """Process the raw FMCSA API response into a structured DataFrame"""
        try:
            content = data.get("content", {})
            carrier = content.get("carrier", {})
            
            # Extract company information
            company_info = {
                "Company Name": carrier.get("legalName", "N/A"),
                "DBA Name": carrier.get("dbaName", ""),
                "DOT Number": carrier.get("dotNumber", "N/A"),
                "MC Number": carrier.get("mcNumber", "N/A"),
                "Operating Status": "Active" if carrier.get("allowedToOperate") == "Y" else "Out of Service",
                "Out of Service": "Yes" if carrier.get("outOfService") == "Y" else "No",
                "Safety Rating": carrier.get("safetyRating", "Not Rated"),
                "Total Vehicles": carrier.get("totalPowerUnits", 0),
                "Total Drivers": carrier.get("totalDrivers", 0),
            }
            
            # Add address information
            company_info.update({
                "Address": f"{carrier.get('phyStreet', '')}, {carrier.get('phyCity', '')}, {carrier.get('phyState', '')} {carrier.get('phyZip', '')}".strip(", "),
                "Phone": carrier.get("telephone", "N/A"),
            })
            
            # Extract BASIC scores if available
            basics = content.get("basics", [])
            if isinstance(basics, list):
                for basic in basics:
                    if isinstance(basic, dict):
                        basic_desc = basic.get("basicShortDesc", "Unknown")
                        percentile = basic.get("percentile", "N/A")
                        
                        # Check for various status indicators
                        if percentile == "N/A":
                            if basic.get("inconclusive"):
                                percentile = "Inconclusive"
                            elif basic.get("noViolations"):
                                percentile = "No Violations"
                            elif basic.get("insufficientData"):
                                percentile = "Insufficient Data"
                        
                        company_info[f"BASIC - {basic_desc}"] = percentile
                        
                        # Add deficiency indicators
                        if basic.get("rdDeficient") == "Y":
                            company_info[f"{basic_desc} - Deficient"] = "Yes"
            
            # Add last updated timestamp
            company_info["Last Updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Create DataFrame
            df = pd.DataFrame([company_info])
            return df
        
        except Exception as e:
            logger.error(f"Error processing safety data: {e}")
            raise ValueError(f"Error processing safety data: {e}")

@st.cache_data(ttl=86400)  # Cache for 24 hours
def fetch_company_safety_data(dot_number: str) -> pd.DataFrame:
    """
    Main function to fetch company safety data from FMCSA
    
    Args:
        dot_number: The DOT number to look up
        
    Returns:
        DataFrame with safety data
    """
    try:
        fetcher = FMCSADataFetcher()
        df = fetcher.fetch_company_safety_data(dot_number)
        return df
    except Exception as e:
        logger.error(f"Error in fetch_company_safety_data: {e}")
        # Return an error DataFrame
        return pd.DataFrame([{
            "Error": f"Could not fetch safety data: {str(e)}",
            "Last Updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }])

def fetch_company_safety_data_detailed(dot_number: str) -> Dict[str, Any]:
    """
    Fetch detailed safety data including separate BASIC scores
    
    Args:
        dot_number: The DOT number to look up
        
    Returns:
        Dictionary with detailed safety data
    """
    try:
        fetcher = FMCSADataFetcher()
        basic_data = fetcher.fetch_company_basics(dot_number)
        carrier_data = fetcher.fetch_company_safety_data(dot_number)
        
        # Convert DataFrame to dict for first row
        carrier_dict = carrier_data.to_dict('records')[0] if not carrier_data.empty else {}
        
        # Combine data
        result = {
            "carrier": carrier_dict,
            "basics": basic_data
        }
        
        return result
    except Exception as e:
        logger.error(f"Error in fetch_company_safety_data_detailed: {e}")
        return {"error": str(e)}

# For testing
if __name__ == "__main__":
    # Test with Example Fleet Co's DOT number
    test_dot = "135370"  # Example Fleet Co
    
    print(f"Testing FMCSA API with DOT number: {test_dot}")
    print("-" * 50)
    
    safety_data = fetch_company_safety_data(test_dot)
    print("Company Safety Data:")
    print(safety_data)
    
    if not safety_data.empty:
        print("\nFormatted Output:")
        for col, val in safety_data.iloc[0].items():
            print(f"{col}: {val}")