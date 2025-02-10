variable "PROJECT_NAME" {
  description = "The name of the project"
  type        = string
}

variable "AWS_ACCESS_KEY" {
  description = "AWS Access Key for programmatic access"
  type        = string
}

variable "AWS_SECRET_KEY" {
  description = "AWS Secret Key for programmatic access"
  type        = string
}

variable "AWS_SESSION_TOKEN" {
  description = "AWS session token"
  type        = string
  default     = ""
}

variable "AWS_REGION" {
  description = "The AWS region to use"
  type        = string
}

variable "STAGE" {
  description = "The name of the stage this Terraform deployment is for"
  type        = string
}