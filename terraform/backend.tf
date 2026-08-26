terraform {
  backend "azurerm" {
    resource_group_name  = "RG-01"
    storage_account_name = "bankingappterraform"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}