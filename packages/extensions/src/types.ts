export interface Config {
  recipents: string[];
}

export interface Status {
  repository: string;
  options: string[];
  configByDomain: Record<string, Config> | null;
  emails: string[];
}

export interface GET_STATUS_EVENT {
  type: 'GET_STATUS';
}

export interface SELECT_REPOSITORY_EVENT {
  type: 'SELECT_REPOSITORY';
  repo: string;
}

export interface SAVE_PASSPHRASE_EVENT {
  type: 'SAVE_PASSPHRASE';
  passphrase: string;
}

export interface RESET_EVENT {
  type: 'RESET';
}
