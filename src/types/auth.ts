export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  email: string;
  tokens: CognitoTokens;
}
