export interface Config {
  recipents: string[];
  pendingEmail: string;
}

export interface Session {
  repository: string;
  options: string[];
  configByDomain: Record<string, Config> | null;
  emails: string[];
}

export interface GET_SESSION_EVENT {
  type: 'GET_SESSION';
}

export interface LOGIN_EVENT {
  type: 'LOGIN';
}

export interface LOGOUT_EVENT {
  type: 'LOGOUT';
}

export interface UNLOCK_EVENT {
  type: 'UNLOCK';
  repository: string;
  passphrase: string;
}

export interface ASSIGN_NEW_EMAIL_EVENT {
  type: 'ASSIGN_NEW_EMAIL';
  domain: string;
}

export type Message =
  | GET_SESSION_EVENT
  | LOGIN_EVENT
  | LOGOUT_EVENT
  | UNLOCK_EVENT
  | ASSIGN_NEW_EMAIL_EVENT;
