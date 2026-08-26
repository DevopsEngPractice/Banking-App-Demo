location                                 = "Central India"
resource_group_name                      = "RG-02"
vnet_address_space                       = ["10.0.0.0/16"]
aks_subnet_name                          = "subnet-aks"
aks_subnet_address_prefixes              = ["10.0.1.0/24"]
private_endpoint_subnet_name             = "subnet-private-endpoint"
private_endpoint_subnet_address_prefixes = ["10.0.2.0/24"]
acr_name                                 = "bankingAppAcr121"
acr_sku                                  = "Standard"

key_vault_name = "bankingApp-Key-Vault123"

aks_name   = "Banking-App-Cluster121"
dns_prefix = "banking-app-dev001"

aks_node_count = 2
aks_vm_size    = "Standard_D2s_v5"

