using './main.bicep'

param baseName = 'sysmon'
param grafanaMajorVersion = '11'
param logRetentionDays = 30

// Object ID of the user/group that should administer Grafana.
// deploy.sh fills this in with the signed-in user automatically.
param grafanaAdminPrincipalId = ''

// VMs in the same resource group to onboard to guest-OS metrics (memory %, disk free %).
// Platform metrics (CPU, disk, network) work for every VM without this.
param vms = [
  // { name: 'web-01', osType: 'Linux' }
  // { name: 'app-01', osType: 'Windows' }
]
