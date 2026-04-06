#!/bin/bash
set -e

# Onboarding Release Verification Script
# Purpose: Run all onboarding test suites and report aggregate pass/fail status
# Output: Summary table to stdout; exit 0 only if all suites pass
# Usage: ./scripts/onboarding-release-verify.sh

declare -A suite_results
declare -A suite_timestamps
declare -a suite_names=(
  "test:onboarding-phase1"
  "test:onboarding-phase6"
  "test:onboarding-drift"
  "test:onboarding-alerts"
)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====== Onboarding Release Verification ======${NC}"
echo "Starting test suite execution at $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo ""

all_passed=true
results_table=""

for suite in "${suite_names[@]}"; do
  echo -e "${YELLOW}[*] Running ${suite}...${NC}"
  
  start_time=$(date +%s)
  
  # Run the test suite and capture exit code
  if npm run "$suite" 2>&1; then
    suite_results["$suite"]="PASS"
    result_color="${GREEN}PASS${NC}"
  else
    suite_results["$suite"]="FAIL"
    result_color="${RED}FAIL${NC}"
    all_passed=false
  fi
  
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  suite_timestamps["$suite"]="$(date -u +'%Y-%m-%dT%H:%M:%SZ')|${duration}s"
  
  echo -e "  Result: ${result_color}"
  echo ""
done

# Build summary table
echo -e "${BLUE}====== Test Results Summary ======${NC}"
echo ""
printf "%-35s %-15s %-20s %-10s\n" "Test Suite" "Status" "Timestamp" "Duration"
printf "%-35s %-15s %-20s %-10s\n" "---" "---" "---" "---"

for suite in "${suite_names[@]}"; do
  status="${suite_results[$suite]}"
  if [ "$status" = "PASS" ]; then
    status_colored="${GREEN}${status}${NC}"
  else
    status_colored="${RED}${status}${NC}"
  fi
  
  timestamp_info="${suite_timestamps[$suite]}"
  timestamp=$(echo "$timestamp_info" | cut -d'|' -f1)
  duration=$(echo "$timestamp_info" | cut -d'|' -f2)
  
  printf "%-35s %-15b %-20s %-10s\n" "$suite" "$status_colored" "$timestamp" "$duration"
done

echo ""
echo -e "${BLUE}====== Release Readiness ======${NC}"

if [ "$all_passed" = true ]; then
  echo -e "${GREEN}All test suites passed. Release candidate ready for sign-off.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review test results above."
  echo "  2. Complete ONBOARDING_RELEASE_EVIDENCE_PACK.md Section 2 (Test Log Template)."
  echo "  3. Verify Section 3 (Build Verification Record) with build metadata."
  echo "  4. Sign Section 6 (Go/No-Go Decision Matrix)."
  exit 0
else
  echo -e "${RED}One or more test suites failed. Release blocked.${NC}"
  echo ""
  echo "Failed suites:"
  for suite in "${suite_names[@]}"; do
    if [ "${suite_results[$suite]}" = "FAIL" ]; then
      echo "  - $suite"
    fi
  done
  echo ""
  echo "Action items:"
  echo "  1. Review test output above for failure details."
  echo "  2. Fix failing tests in src/lib/onboarding/."
  echo "  3. Re-run ./scripts/onboarding-release-verify.sh to validate fixes."
  exit 1
fi
