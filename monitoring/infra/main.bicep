// Azure Managed Grafana + Log Analytics for VM system monitoring.
//
// Deploys:
//   * Log Analytics workspace (guest-OS performance counters + heartbeats)
//   * Data Collection Rule that collects CPU / memory / disk / network counters
//     from Linux and Windows VMs via the Azure Monitor Agent (AMA)
//   * Azure Managed Grafana (Standard tier) with a system-assigned identity
//   * Role assignments:
//       - Grafana identity -> Monitoring Reader on this resource group
//       - Optional admin principal -> Grafana Admin on the Grafana workspace
//   * Optional: AMA extension + DCR association for each VM in `vms`
//
// Deploy with ../deploy.sh, or:
//   az deployment group create -g <rg> -f main.bicep -p main.bicepparam

targetScope = 'resourceGroup'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Base name used to derive resource names.')
@minLength(3)
@maxLength(15)
param baseName string = 'sysmon'

@description('Name of the Azure Managed Grafana workspace (2-23 chars, letters, digits, dashes).')
@maxLength(23)
param grafanaName string = '${baseName}-grafana-${take(uniqueString(resourceGroup().id), 5)}'

@description('Grafana major version.')
@allowed([
  '11'
  '12'
])
param grafanaMajorVersion string = '11'

@description('Object ID of a user or group to grant Grafana Admin. Leave empty to skip.')
param grafanaAdminPrincipalId string = ''

@description('Principal type of grafanaAdminPrincipalId.')
@allowed([
  'User'
  'Group'
  'ServicePrincipal'
])
param grafanaAdminPrincipalType string = 'User'

@description('Log Analytics data retention in days.')
@minValue(30)
@maxValue(730)
param logRetentionDays int = 30

@description('VMs in THIS resource group to onboard to guest-OS monitoring (installs Azure Monitor Agent and associates the DCR). Example: [{ name: \'web-01\', osType: \'Linux\' }]')
param vms array = []

@description('Tags applied to every resource.')
param tags object = {
  workload: 'system-monitoring'
}

// Built-in role definition IDs
var roleMonitoringReader = '43d0d8ad-25c7-4714-9337-8ba259a9fe05'
var roleGrafanaAdmin = '22926164-76b3-42b3-bc55-97df8dab3e41'

// ---------------------------------------------------------------------------
// Log Analytics workspace
// ---------------------------------------------------------------------------
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${baseName}-law-${take(uniqueString(resourceGroup().id), 5)}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: logRetentionDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ---------------------------------------------------------------------------
// Data Collection Rule: guest-OS performance counters -> Perf table
// ---------------------------------------------------------------------------
resource dcr 'Microsoft.Insights/dataCollectionRules@2023-03-11' = {
  name: '${baseName}-dcr-vm-perf'
  location: location
  tags: tags
  properties: {
    description: 'Guest OS performance counters for the system monitoring Grafana dashboard.'
    dataSources: {
      performanceCounters: [
        {
          name: 'linuxPerf'
          streams: [
            'Microsoft-Perf'
          ]
          samplingFrequencyInSeconds: 60
          counterSpecifiers: [
            'Processor(*)\\% Processor Time'
            'Memory(*)\\% Used Memory'
            'Memory(*)\\Available MBytes Memory'
            'Logical Disk(*)\\% Free Space'
            'Logical Disk(*)\\% Used Space'
            'Logical Disk(*)\\Disk Read Bytes/sec'
            'Logical Disk(*)\\Disk Write Bytes/sec'
            'Network(*)\\Total Bytes Received'
            'Network(*)\\Total Bytes Transmitted'
            'System(*)\\Uptime'
          ]
        }
        {
          name: 'windowsPerf'
          streams: [
            'Microsoft-Perf'
          ]
          samplingFrequencyInSeconds: 60
          counterSpecifiers: [
            '\\Processor Information(_Total)\\% Processor Time'
            '\\Memory\\% Committed Bytes In Use'
            '\\Memory\\Available Bytes'
            '\\LogicalDisk(*)\\% Free Space'
            '\\LogicalDisk(*)\\Disk Read Bytes/sec'
            '\\LogicalDisk(*)\\Disk Write Bytes/sec'
            '\\Network Interface(*)\\Bytes Received/sec'
            '\\Network Interface(*)\\Bytes Sent/sec'
            '\\System\\System Up Time'
          ]
        }
      ]
    }
    destinations: {
      logAnalytics: [
        {
          name: 'law'
          workspaceResourceId: logAnalytics.id
        }
      ]
    }
    dataFlows: [
      {
        streams: [
          'Microsoft-Perf'
        ]
        destinations: [
          'law'
        ]
      }
    ]
  }
}

// ---------------------------------------------------------------------------
// Azure Managed Grafana
// ---------------------------------------------------------------------------
resource grafana 'Microsoft.Dashboard/grafana@2024-10-01' = {
  name: grafanaName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    grafanaMajorVersion: grafanaMajorVersion
    publicNetworkAccess: 'Enabled'
    apiKey: 'Disabled'
    deterministicOutboundIP: 'Disabled'
    zoneRedundancy: 'Disabled'
  }
}

// Grafana's managed identity reads metrics and logs in this resource group.
// For subscription-wide visibility, deploy.sh can also grant this at subscription scope.
resource grafanaMonitoringReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, grafana.id, roleMonitoringReader)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleMonitoringReader)
    principalId: grafana.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource grafanaAdmin 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(grafanaAdminPrincipalId)) {
  name: guid(grafana.id, grafanaAdminPrincipalId, roleGrafanaAdmin)
  scope: grafana
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleGrafanaAdmin)
    principalId: grafanaAdminPrincipalId
    principalType: grafanaAdminPrincipalType
  }
}

// ---------------------------------------------------------------------------
// Optional VM onboarding: Azure Monitor Agent + DCR association
// ---------------------------------------------------------------------------
resource existingVms 'Microsoft.Compute/virtualMachines@2024-07-01' existing = [for vm in vms: {
  name: vm.name
}]

resource amaExtension 'Microsoft.Compute/virtualMachines/extensions@2024-07-01' = [for (vm, i) in vms: {
  parent: existingVms[i]
  name: vm.osType == 'Windows' ? 'AzureMonitorWindowsAgent' : 'AzureMonitorLinuxAgent'
  location: location
  properties: {
    publisher: 'Microsoft.Azure.Monitor'
    type: vm.osType == 'Windows' ? 'AzureMonitorWindowsAgent' : 'AzureMonitorLinuxAgent'
    typeHandlerVersion: '1.0'
    autoUpgradeMinorVersion: true
    enableAutomaticUpgrade: true
  }
}]

resource dcrAssociation 'Microsoft.Insights/dataCollectionRuleAssociations@2023-03-11' = [for (vm, i) in vms: {
  name: '${baseName}-dcra'
  scope: existingVms[i]
  properties: {
    dataCollectionRuleId: dcr.id
    description: 'Send guest OS performance counters to ${logAnalytics.name}.'
  }
  dependsOn: [
    amaExtension[i]
  ]
}]

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
output grafanaName string = grafana.name
output grafanaEndpoint string = grafana.properties.endpoint
output grafanaPrincipalId string = grafana.identity.principalId
output logAnalyticsWorkspaceId string = logAnalytics.id
output dataCollectionRuleId string = dcr.id
