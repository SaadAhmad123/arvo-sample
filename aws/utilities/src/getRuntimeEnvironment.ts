export type RuntimeEnvironment = {
  isLambda: boolean;
  environment: 'local' | 'development' | 'staging' | 'production';
  region?: string;
  functionName?: string;
  functionVersion?: string;
};

/**
 * Gets current runtime environment information
 *
 * @returns Runtime environment details including Lambda context and deployment environment
 *
 * @example
 * ```typescript
 * const runtime = getRuntimeEnvironment();
 * if (runtime.isLambda && runtime.environment === 'production') {
 *   // Production Lambda specific logic
 * }
 * ```
 */
export const getRuntimeEnvironment = (): RuntimeEnvironment => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  return {
    isLambda,
    environment: (process.env.NODE_ENV || 'development') as RuntimeEnvironment['environment'],
    region: process.env.AWS_REGION,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
  };
};
