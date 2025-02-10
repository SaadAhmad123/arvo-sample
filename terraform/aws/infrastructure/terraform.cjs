const fs = require('node:fs');
const { execSync } = require('node:child_process');

/**
 * @constant {string}
 */
const HELP_TEXT = `
Terraform Command Runner
-----------------------
Usage: node terraform.cjs <command>

Commands:
  init        Initialize Terraform with correct backend based on STAGE in tfvars
  plan        Run terraform plan
  apply       Run terraform apply (will prompt for confirmation)
  apply-auto  Run terraform apply with auto-approve flag
  destroy     Run terraform destroy (will prompt for confirmation)
  help        Show this help message

Environment:
  Reads AWS credentials and STAGE from terraform.tfvars automatically

Note: Make sure terraform.tfvars contains AWS_ACCESS_KEY, AWS_SECRET_KEY, and STAGE variables
`;

/**
 * @constant {string}
 */
const TFVARS_EXAMPLE = `
AWS_ACCESS_KEY = "your_access_key"
AWS_SECRET_KEY = "your_secret_key"
STAGE = "dev|prod|stage"
`;

/**
 * Generates example backend configuration content
 * @param {string} stage - The deployment stage (dev/prod/stage)
 * @returns {string} Example backend configuration
 */
const BACKEND_EXAMPLE = (stage) => `
bucket = "your-terraform-state-bucket"
key    = "${stage}/terraform.tfstate"
region = "your-aws-region"
`;

/**
 * @constant {string}
 */
const REQUIRED_VARS = ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'STAGE'].join('\n- ');

/**
 * Displays help information about the Terraform command runner
 * @returns {void}
 */
const showHelp = () => {
  console.log(HELP_TEXT);
  process.exit(0);
};

/**
 * Validates the existence of terraform.tfvars file
 * @param {string} filePath - Path to the terraform.tfvars file
 * @throws {Error} If the file doesn't exist
 * @returns {void}
 */
const validateTfvarsFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `terraform.tfvars file not found at ${filePath}\n` +
        `Please create terraform.tfvars file with required variables:${TFVARS_EXAMPLE}`,
    );
  }
};

/**
 * Validates the existence of backend configuration for the specified stage
 * @param {string} stage - Environment stage (dev/prod/stage)
 * @throws {Error} If the backend configuration file doesn't exist
 * @returns {void}
 */
const validateBackendConfig = (stage) => {
  const backendPath = `backends/${stage}.hcl`;
  if (!fs.existsSync(backendPath)) {
    throw new Error(
      `Backend configuration file not found: ${backendPath}\n` +
        `Please create the backend configuration file for stage: ${stage}\n` +
        `Example backend/${stage}.hcl content:${BACKEND_EXAMPLE(stage)}`,
    );
  }
};

/**
 * Validates that Terraform is installed and accessible in the system PATH
 * @throws {Error} If Terraform is not installed or not in PATH
 * @returns {void}
 */
const validateTerraformInstallation = () => {
  try {
    execSync('terraform version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error(
      'Terraform is not installed or not in PATH\n' +
        'Please install Terraform: https://developer.hashicorp.com/terraform/downloads',
    );
  }
};

/**
 * Parses terraform.tfvars file and extracts configuration variables
 * @param {string} filePath - Path to the terraform.tfvars file
 * @returns {Object.<string, string>} Configuration object containing terraform variables
 * @throws {Error} If parsing fails or file is improperly formatted
 */
const parseTfvars = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const config = {};

    lines.forEach((line) => {
      if (!line.trim()) return;
      const [key, value] = line.split('=').map((part) => part.trim());
      config[key] = value.replace(/[",\s]/g, '');
    });
    return config;
  } catch (error) {
    throw new Error(`Failed to parse terraform.tfvars: ${error.message} Please ensure the file is properly formatted`);
  }
};

/**
 * Executes Terraform commands with proper configuration and validation
 * @param {('init'|'plan'|'apply'|'apply-auto'|'help')} command - Terraform command to execute
 * @throws {Error} If command execution fails, validation fails, or command is invalid
 * @returns {void}
 */
const runTerraform = (command) => {
  try {
    if (command === 'help') {
      showHelp();
      return;
    }

    // Validate terraform installation first
    validateTerraformInstallation();

    // Validate tfvars file exists
    validateTfvarsFile('./terraform.tfvars');

    const config = parseTfvars('./terraform.tfvars');
    const { AWS_ACCESS_KEY, AWS_SECRET_KEY, STAGE } = config;

    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !STAGE) {
      throw new Error(
        'Missing required variables in terraform.tfvars\n' + 'Required variables:\n' + `- ${REQUIRED_VARS}`,
      );
    }

    validateBackendConfig(STAGE);
    process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY;
    process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_KEY;

    switch (command) {
      case 'init':
        console.log(`Initializing Terraform for stage: ${STAGE}`);
        execSync(`terraform init -backend-config=backends/${STAGE}.hcl`, { stdio: 'inherit' });
        break;
      case 'plan':
        console.log('Running Terraform plan');
        execSync('terraform plan', { stdio: 'inherit' });
        break;
      case 'apply':
        console.log('Running Terraform apply');
        execSync('terraform apply', { stdio: 'inherit' });
        break;
      case 'apply-auto':
        console.log('Running Terraform apply with auto-approve');
        execSync('terraform apply -auto-approve', { stdio: 'inherit' });
        break;
      case 'destroy':
        console.log(`Running Terraform destroy for stage: ${STAGE}`);
        console.log('\x1b[31m%s\x1b[0m', 'WARNING: This will destroy all resources. Please review carefully.');
        execSync('terraform destroy', { stdio: 'inherit' });
        break;
      default:
        showHelp();
        break
    }
  } catch (error) {
    console.error('\nError:', error.message);
    console.log('\nFor help, run: node terraform-commands.js help');
    process.exit(1);
  }
};

const command = process.argv[2];
if (!command) {
  showHelp();
} else {
  runTerraform(command);
}
