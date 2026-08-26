resource "azurerm_resource_group" "banking" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_virtual_network" "banking" {
  name                = var.vnet_name
  location            = var.location
  resource_group_name = azurerm_resource_group.banking.name

  address_space = var.vnet_address_space

}

resource "azurerm_subnet" "aks" {
  name                 = var.aks_subnet_name
  resource_group_name  = azurerm_resource_group.banking.name
  virtual_network_name = azurerm_virtual_network.banking.name

  address_prefixes = var.aks_subnet_address_prefixes
}

resource "azurerm_subnet" "private_endpoints" {
  name                = var.private_endpoint_subnet_name
  resource_group_name = azurerm_resource_group.banking.name

  virtual_network_name = azurerm_virtual_network.banking.name

  address_prefixes = var.private_endpoint_subnet_address_prefixes
}

resource "azurerm_network_security_group" "aks" {
  name                = "nsg-aks"
  location            = var.location
  resource_group_name = azurerm_resource_group.banking.name
}

resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.aks.id
}

resource "azurerm_container_registry" "banking" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.banking.name
  location            = var.location

  sku           = var.acr_sku
  admin_enabled = false
}

resource "azurerm_key_vault" "banking" {
  name                = var.key_vault_name
  location            = var.location
  resource_group_name = azurerm_resource_group.banking.name

  tenant_id = data.azurerm_client_config.current.tenant_id

  sku_name = "standard"

  enable_rbac_authorization = true
}

data "azurerm_client_config" "current" {}

resource "azurerm_kubernetes_cluster" "banking" {
  name                = var.aks_name
  location            = var.location
  resource_group_name = azurerm_resource_group.banking.name

  dns_prefix = var.dns_prefix

  default_node_pool {
    name           = "system"
    node_count     = var.aks_node_count
    vm_size        = var.aks_vm_size
    vnet_subnet_id = azurerm_subnet.aks.id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin     = "azure"            # or "kubenet" depending on your setup
    service_cidr       = "172.16.0.0/16"    # Non-overlapping range
    dns_service_ip     = "172.16.0.10"     # Must be within service_cidr range
  }
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id = azurerm_kubernetes_cluster.banking.kubelet_identity[0].object_id

  role_definition_name = "AcrPull"

  scope = azurerm_container_registry.banking.id
}

# resource "azurerm_resource_group" "terraform_state" {
#   name     = "rg-terraform-state"
#   location = "Central India"
# }

# resource "azurerm_storage_account" "terraform_state" {
#   name                     = "tfstatebanking123"
#   resource_group_name      = azurerm_resource_group.terraform_state.name
#   location                 = azurerm_resource_group.terraform_state.location

#   account_tier             = "Standard"
#   account_replication_type = "LRS"

#   min_tls_version = "TLS1_2"
# }

# resource "azurerm_storage_container" "terraform_state" {
#   name                  = "tfstate"
#   storage_account_name  = azurerm_storage_account.terraform_state.name

#   container_access_type = "private"
# }