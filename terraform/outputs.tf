output "resource_group_name" {
  value = azurerm_resource_group.banking.name
}

output "resource_group_location" {
  value = azurerm_resource_group.banking.location
}

output "vnet_id" {
  value = azurerm_virtual_network.banking.id
}

output "aks_subnet_id" {
  value = azurerm_subnet.aks.id
}

output "private_endpoint_subnet_id" {
  value = azurerm_subnet.private_endpoints.id
}

output "acr_login_server" {
  value = azurerm_container_registry.banking.login_server
}

output "key_vault_uri" {
  value = azurerm_key_vault.banking.vault_uri
}

output "aks_name" {
  value = azurerm_kubernetes_cluster.banking.name
}

output "aks_id" {
  value = azurerm_kubernetes_cluster.banking.id
}

output "aks_kubelet_identity" {
  value = azurerm_kubernetes_cluster.banking.kubelet_identity[0].object_id
}