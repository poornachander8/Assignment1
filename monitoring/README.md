# Azure system monitoring with Grafana

This folder sets up **Azure Managed Grafana** and imports a dashboard for monitoring Azure virtual machines.

```
monitoring/
├── deploy.sh                          # one-command deploy + dashboard import
├── infra/
│   ├── main.bicep                     # Grafana, Log Analytics, DCR, role assignments
│   └── main.bicepparam                # parameters (edit `vms` to onboard VMs)
└── dashboards/
    └── system-monitoring.json         # Grafana dashboard (uid: azure-vm-sysmon)
```

## What gets deployed

| Resource | Purpose |
| --- | --- |
| Azure Managed Grafana (Standard) | Hosts the dashboard; uses a system-assigned managed identity to read Azure Monitor |
| Log Analytics workspace | Stores guest-OS performance counters and agent heartbeats |
| Data Collection Rule | Collects CPU, memory, disk and network counters from Linux and Windows VMs |
| Role: Monitoring Reader | Lets Grafana's identity read metrics/logs in the resource group (or subscription) |
| Role: Grafana Admin | Lets you (the deployer) edit dashboards |
| Azure Monitor Agent + DCR association | Only for the VMs listed in `vms`, optional |

## Dashboard

**Variables:** data source, subscription, resource group, VM (multi-select / All), Log Analytics workspace.

| Row | Panels | Data source |
| --- | --- | --- |
| Overview | Avg CPU, Peak CPU, Min available memory, VM availability | Azure Monitor platform metrics |
| CPU & Memory | CPU utilization %, Available memory | Platform metrics |
| Disk | Read/write throughput, read/write IOPS, OS disk queue depth | Platform metrics |
| Network | Network in / out | Platform metrics |
| Guest OS (collapsed) | Memory used %, Disk free space per volume, Agent heartbeat | Log Analytics (needs Azure Monitor Agent) |

The first four rows work for **any VM, with no agent installed**. The Guest OS row needs the Azure Monitor Agent and the DCR, which you can set up by adding VMs to `vms` in `infra/main.bicepparam`.

## Deploy

Prerequisites: [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), `az login`, and Owner (or User Access Administrator) on the target resource group. Role assignments fail without it.

```bash
cd monitoring
chmod +x deploy.sh
./deploy.sh rg-sysmon eastus
```

To see VMs in **every** resource group of the subscription, not only `rg-sysmon`:

```bash
SUBSCRIPTION_WIDE=true ./deploy.sh rg-sysmon eastus
```

The script prints the Grafana URL when it finishes. Open **Dashboards → Azure VM System Monitoring**, then pick your subscription, resource group and VMs.

### Onboard VMs for guest-OS metrics

Edit `infra/main.bicepparam`. The VMs must be in the same resource group as the deployment:

```bicep
param vms = [
  { name: 'web-01', osType: 'Linux' }
  { name: 'app-01', osType: 'Windows' }
]
```

Then re-run `./deploy.sh`. Data shows up in the `Perf` table after about 5–10 minutes. For VMs in other resource groups, associate the DCR in the portal: **Monitor → Data Collection Rules → sysmon-dcr-vm-perf → Resources → Add**.

### Manual import (existing Grafana)

If you already have a Grafana workspace, import just the dashboard:

```bash
az grafana dashboard import -n <grafana-name> -g <rg> --definition @dashboards/system-monitoring.json --overwrite true
```

Or in the Grafana UI: **Dashboards → New → Import → Upload JSON file**.

## Cost notes

- Azure Managed Grafana Standard is billed per instance hour plus per active user. The Essential tier is being retired, so this template uses Standard.
- Log Analytics bills for ingested data. Each VM sends roughly 20 counters per minute, which is usually well under 1 GB/month per VM.
- Platform metrics (the first four dashboard rows) are free.

## Clean up

```bash
az group delete --name rg-sysmon --yes --no-wait
```
