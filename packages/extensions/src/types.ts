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
