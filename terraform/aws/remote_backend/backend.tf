locals {
  environments = ["dev", "np", "prod"]
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.PROJECT_NAME}-terraform-state"
  lifecycle {
    prevent_destroy = true
  }
}

# Dynamically create a pseudo-folder in the S3 bucket for each environment
resource "aws_s3_object" "environment_state_folders" {
  for_each = toset(local.environments)
  bucket   = aws_s3_bucket.terraform_state.bucket
  key      = "${each.value}/" # This creates a pseudo-folder
  content  = ""
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.bucket
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_state" {
  name         = "${var.PROJECT_NAME}-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}