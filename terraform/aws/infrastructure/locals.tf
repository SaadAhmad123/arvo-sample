locals {
  project     = var.PROJECT_NAME
  stage       = var.STAGE
  region      = var.AWS_REGION
  version     = 1
  name_prefix = "${local.project}-${local.stage}-${local.version}"
  tags = {
    project        = local.project
    version        = local.version
    infrastructure = "core"
    stage          = local.stage
  }
}