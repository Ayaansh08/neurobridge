/**
 * AWS Cognito & API Client Configuration for NeuroBridge
 * Reads from Vite environment variables with graceful dev fallbacks.
 */
export interface AuthConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  apiEndpoint: string;
}

export const authConfig: AuthConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '',
  apiEndpoint: import.meta.env.VITE_API_GATEWAY_URL || '',
};
