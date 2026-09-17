import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  type ICognitoStorage,
} from 'amazon-cognito-identity-js';
import { authConfig } from '../config/auth';
import type { CognitoTokens } from '../types/auth';

export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SignInSession {
  email: string;
  tokens: CognitoTokens;
}

type PasswordAuthUser = CognitoUser & {
  authenticateUserPlainUsernamePassword: (
    details: AuthenticationDetails,
    callbacks: Parameters<CognitoUser['authenticateUser']>[1]
  ) => void;
};

const memoryStorage = (): ICognitoStorage => {
  const store = new Map<string, string>();

  return {
    setItem: (key, value) => store.set(key, value),
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
};

class CognitoAuthService {
  private storage = memoryStorage();

  private getPool(): CognitoUserPool {
    if (!authConfig.userPoolId || !authConfig.userPoolClientId) {
      throw new Error('Cognito is not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_APP_CLIENT_ID.');
    }

    return new CognitoUserPool({
      UserPoolId: authConfig.userPoolId,
      ClientId: authConfig.userPoolClientId,
      Storage: this.storage,
    });
  }

  private getUser(email: string): CognitoUser {
    return new CognitoUser({
      Username: email,
      Pool: this.getPool(),
      Storage: this.storage,
    });
  }

  signIn(email: string, password: string): Promise<AuthResult<SignInSession>> {
    return new Promise((resolve) => {
      let user: CognitoUser;
      let details: AuthenticationDetails;

      try {
        user = this.getUser(email);
        details = new AuthenticationDetails({ Username: email, Password: password });
      } catch (err) {
        resolve({ success: false, error: this.formatErrorMessage(err) });
        return;
      }

      (user as PasswordAuthUser).authenticateUserPlainUsernamePassword(details, {
        onSuccess: (session: CognitoUserSession) => {
          resolve({
            success: true,
            data: {
              email,
              tokens: {
                idToken: session.getIdToken().getJwtToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken(),
              },
            },
          });
        },
        onFailure: (err) => {
          resolve({ success: false, error: this.formatErrorMessage(err) });
        },
      });
    });
  }

  signUp(email: string, password: string): Promise<AuthResult<{ userConfirmed: boolean }>> {
    return new Promise((resolve) => {
      let pool: CognitoUserPool;

      try {
        pool = this.getPool();
      } catch (err) {
        resolve({ success: false, error: this.formatErrorMessage(err) });
        return;
      }

      pool.signUp(
        email,
        password,
        [new CognitoUserAttribute({ Name: 'email', Value: email })],
        [],
        (err, result) => {
          if (err) {
            resolve({ success: false, error: this.formatErrorMessage(err) });
            return;
          }

          resolve({ success: true, data: { userConfirmed: !!result?.userConfirmed } });
        }
      );
    });
  }

  confirmSignUp(email: string, code: string): Promise<AuthResult> {
    return new Promise((resolve) => {
      let user: CognitoUser;

      try {
        user = this.getUser(email);
      } catch (err) {
        resolve({ success: false, error: this.formatErrorMessage(err) });
        return;
      }

      user.confirmRegistration(code, true, (err) => {
        resolve(err ? { success: false, error: this.formatErrorMessage(err) } : { success: true });
      });
    });
  }

  signOut(email?: string): void {
    if (email) {
      this.getUser(email).signOut();
    }
    this.storage.clear();
  }

  private formatErrorMessage(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes('NotAuthorizedException') ||
      message.includes('UserNotFoundException') ||
      message.includes('Incorrect username or password')
    ) {
      return 'Incorrect email or password';
    }

    if (message.includes('UsernameExistsException')) {
      return 'An account with this email already exists';
    }

    if (message.includes('InvalidPasswordException')) {
      return 'Password must meet the Cognito password requirements';
    }

    if (message.includes('CodeMismatchException')) {
      return 'Invalid confirmation code';
    }

    if (message.includes('ExpiredCodeException')) {
      return 'Confirmation code expired';
    }

    if (message.includes('UserNotConfirmedException')) {
      return 'Confirm your email before signing in';
    }

    return message || 'Something went wrong';
  }
}

export const cognitoAuth = new CognitoAuthService();
