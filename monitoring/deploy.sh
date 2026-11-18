#!/usr/bin/env bash
# Deploys Azure Managed Grafana + Log Analytics and imports the system monitoring dashboard.
#
# Usage:
#   ./deploy.sh <resource-group> [location]
#
# Optional environment variables:
#   SUBSCRIPTION_WIDE=true   Also grant Grafana "Monitoring Reader" on the whole subscription,
#                            so the dashboard can show VMs in every resource group.
#
# Prerequisites: Azure CLI >= 2.60, signed in with `az login`, and Owner or
# User Access Administrator on the resource group (needed for role assignments).
set -euo pipefail

RG="${1:?Usage: ./deploy.sh <resource-group> [location]}"
LOCATION="${2:-eastus}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Ensuring the Azure Managed Grafana CLI extension is installed"
az extension add --name amg --upgrade --only-show-errors

echo "==> Creating resource group ${RG} in ${LOCATION}"
az group create --name "$RG" --location "$LOCATION" --output none

ADMIN_ID="$(az ad signed-in-user show --query id --output tsv 2>/dev/null || true)"
ADMIN_TYPE="User"
if [[ -z "$ADMIN_ID" ]]; then
  # Signed in as a service principal (for example in CI).
  ADMIN_ID="$(az account show --query user.name --output tsv | xargs -I{} az ad sp show --id {} --query id --output tsv)"
  ADMIN_TYPE="ServicePrincipal"
fi

echo "==> Deploying infrastructure (this takes a few minutes)"
OUTPUTS="$(az deployment group create \
  --resource-group "$RG" \
  --name sysmon-grafana \
  --template-file "$SCRIPT_DIR/infra/main.bicep" \
  --parameters "$SCRIPT_DIR/infra/main.bicepparam" \
  --parameters location="$LOCATION" grafanaAdminPrincipalId="$ADMIN_ID" grafanaAdminPrincipalType="$ADMIN_TYPE" \
  --query properties.outputs --output json)"

GRAFANA_NAME="$(echo "$OUTPUTS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["grafanaName"]["value"])')"
GRAFANA_URL="$(echo "$OUTPUTS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["grafanaEndpoint"]["value"])')"
GRAFANA_PRINCIPAL="$(echo "$OUTPUTS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["grafanaPrincipalId"]["value"])')"

if [[ "${SUBSCRIPTION_WIDE:-false}" == "true" ]]; then
  SUB_ID="$(az account show --query id --output tsv)"
  echo "==> Granting Grafana Monitoring Reader on subscription ${SUB_ID}"
  az role assignment create \
    --assignee-object-id "$GRAFANA_PRINCIPAL" \
    --assignee-principal-type ServicePrincipal \
    --role "Monitoring Reader" \
    --scope "/subscriptions/${SUB_ID}" \
    --output none
fi

echo "==> Waiting for the Grafana Admin role assignment to take effect"
for attempt in 1 2 3 4 5 6; do
  if az grafana dashboard import \
      --name "$GRAFANA_NAME" \
      --resource-group "$RG" \
      --definition "@$SCRIPT_DIR/dashboards/system-monitoring.json" \
      --overwrite true \
      --output none 2>/dev/null; then
    IMPORTED=true
    break
  fi
  echo "    not ready yet (attempt ${attempt}/6), retrying in 30s"
  sleep 30
done

if [[ "${IMPORTED:-false}" != "true" ]]; then
  echo "Dashboard import failed. Retry later with:" >&2
  echo "  az grafana dashboard import -n $GRAFANA_NAME -g $RG --definition @$SCRIPT_DIR/dashboards/system-monitoring.json --overwrite true" >&2
  exit 1
fi

echo
echo "Done."
echo "  Grafana:   ${GRAFANA_URL}"
echo "  Dashboard: ${GRAFANA_URL}/d/azure-vm-sysmon"
