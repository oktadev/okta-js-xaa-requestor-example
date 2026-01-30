import type { Request } from 'express';
import type { Session } from 'express-session';

export interface AuthSessionData {
  codeVerifier?: string;
  user?: {
    accessToken: string;
    idToken?: string;
    claims: Record<string, unknown>;
  };
}

export interface RequestWithSession extends Request {
  session: Session & AuthSessionData;
}
