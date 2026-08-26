variable "location" {
  description = "Azure Region"
  type        = string
  default     = "Central India"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}

variable "vnet_name" {
  description = "Virtual network name"
  type        = string
}

variable "vnet_address_space" {
  type        = list(string)
  description = "Vnet address space"
}

variable "aks_subnet_name" {
  type = string
}

variable "aks_subnet_address_prefixes" {
  type = list(string)
}

variable "private_endpoint_subnet_name" {
  type = string
}

variable "private_endpoint_subnet_address_prefixes" {
  type = list(string)
}

variable "acr_name" {
  type        = string
  description = "Azure Container Registry"
}

variable "acr_sku" {
  type    = string
  default = "standard"
}

variable "key_vault_name" {
  type        = string
  description = "Azure key Vault name"
}

variable "aks_name" {
  type = string
}

variable "dns_prefix" {
  type = string
}

variable "aks_node_count" {
  type    = number
  default = 2
}

variable "aks_vm_size" {
  type    = string
  default = "Standard_D2s_v5"
}