#!/bin/bash
# Deploy Compliance Government Module API to Google Cloud Run
# Usage: ./deploy/cloud-run-deploy.sh [PROJECT_ID] [REGION] [SERVICE_NAME]

set -e

# Configuration
PROJECT_ID="${1:-compliance-gov-module}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-compliance-gov-api}"
IMAGE_NAME="compliance-gov-api"
GCR_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}======================================================================${NC}"
echo -e "${YELLOW}Deploying Compliance Government Module to Google Cloud Run${NC}"
echo -e "${YELLOW}======================================================================${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Image: $GCR_IMAGE"
echo ""

# Check for required tools
command -v gcloud &> /dev/null || {
    echo -e "${RED}Error: gcloud CLI not found. Install Google Cloud SDK first.${NC}"
    exit 1
}

# Ensure we're authenticated
echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Build Docker image locally
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest -f Dockerfile .

# Tag for GCR
echo -e "${YELLOW}Tagging image for GCR...${NC}"
docker tag $IMAGE_NAME:latest $GCR_IMAGE:latest

# Push to Google Container Registry
echo -e "${YELLOW}Pushing image to GCR...${NC}"
docker push $GCR_IMAGE:latest

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $GCR_IMAGE:latest \
    --platform managed \
    --region $REGION \
    --port 8000 \
    --memory 2Gi \
    --cpu 1 \
    --timeout 3600 \
    --max-instances 10 \
    --min-instances 1 \
    --allow-unauthenticated \
    --set-env-vars \
        COMPLIANCE_ENV=production,\
        COMPLIANCE_LLM_PROVIDER=anthropic,\
        COMPLIANCE_EMBEDDING_PROVIDER=openai,\
        COMPLIANCE_LOG_LEVEL=INFO \
    --set-secrets \
        ANTHROPIC_API_KEY=anthropic-api-key:latest,\
        OPENAI_API_KEY=openai-api-key:latest

echo ""
echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}======================================================================${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "Service URL: $SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Set API keys as secrets in Secret Manager:"
echo "   gcloud secrets create anthropic-api-key --replication-policy=automatic"
echo "   echo -n 'sk-ant-...' | gcloud secrets versions add anthropic-api-key --data-file=-"
echo ""
echo "2. Grant Cloud Run service access to secrets"
echo ""
echo "3. Test the API:"
echo "   curl $SERVICE_URL/health"
echo ""
