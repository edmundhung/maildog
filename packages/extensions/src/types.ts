export interface Config {
  recipents: string[];
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
