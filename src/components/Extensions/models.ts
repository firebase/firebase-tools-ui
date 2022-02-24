export type ExtensionName = `publishers/${string}/extensions/${string}`;

export type ExtensionRef = `${string}/${string}`;

export interface Extension {
  name: ExtensionName;
  ref: ExtensionRef;
  state: 'STATE_UNSPECIFIED' | 'PUBLISHED' | 'DEPRECATED';
  spec: ExtensionSpec;
  hash: string;
  sourceDownloadUri: string;
  releaseNotes?: string;
  createTime?: string;
  deprecationMessage?: string;
}

export type ExtensionVersionName = `${ExtensionName}/versions/${string}`;

export type ExtensionVersionRef = `${ExtensionRef}@${string}`;

export interface ExtensionVersion {
  name: ExtensionVersionName;
  ref: ExtensionVersionRef;
  state: 'STATE_UNSPECIFIED' | 'PUBLISHED' | 'DEPRECATED';
  spec: ExtensionSpec;
  hash: string;
  sourceDownloadUri: string;
  releaseNotes?: string;
  createTime?: string;
  deprecationMessage?: string;
}

export type ExtensionInstanceName = `projects/${string}/instances/${string}`;

export interface ExtensionInstance {
  name: ExtensionInstanceName;
  createTime: string;
  updateTime: string;
  state:
    | 'STATE_UNSPECIFIED'
    | 'DEPLOYING'
    | 'UNINSTALLING'
    | 'ACTIVE'
    | 'ERRORED'
    | 'PAUSED';
  config: ExtensionInstanceConfig;
  serviceAccountEmail: string;
  errorStatus?: string;
  lastOperationName?: string;
  lastOperationType?: string;
  extensionRef?: string;
  extensionVersion?: string;
}

export type ExtensionInstanceConfigName = `${ExtensionInstanceName}/configs/${string}`;

export interface ExtensionInstanceConfig {
  name: ExtensionInstanceConfigName;
  createTime: string;
  source: ExtensionSource;
  params: {
    [key: string]: any;
  };
  populatedPostinstallContent?: string;
  extensionRef?: string;
  extensionVersion?: string;
}

export type ExtensionSourceName = `projects/${string}/sources/${string}`;

export interface ExtensionSource {
  name: ExtensionSourceName;
  state: 'STATE_UNSPECIFIED' | 'ACTIVE' | 'DELETED';
  packageUri: string;
  hash: string;
  spec: ExtensionSpec;
  extensionRoot?: string;
  fetchTime?: string;
  lastOperationName?: string;
}

export interface ExtensionSpec {
  specVersion?: string;
  name: string;
  version: string;
  displayName?: string;
  description?: string;
  apis?: Api[];
  roles?: Role[];
  resources: Resource[];
  billingRequired?: boolean;
  author?: Author;
  contributors?: Author[];
  license?: string;
  releaseNotesUrl?: string;
  sourceUrl: string;
  params: Param[];
  preinstallContent?: string;
  postinstallContent?: string;
  readmeContent?: string;
  externalServices?: ExternalService[];
}

export interface ExternalService {
  name: string;
  pricingUri: string;
}

export interface Api {
  apiName: string;
  reason: string;
}

export interface Role {
  role: string;
  reason: string;
}

export interface Resource {
  name: string;
  type: string;
  description?: string;
  properties?: { [key: string]: any };
  propertiesYaml?: string;
}

export interface Author {
  authorName: string;
  url?: string;
}

export interface Param {
  param: string;
  label: string;
  description?: string;
  default?: string;
  type?: ParamType;
  options?: ParamOption[];
  required?: boolean;
  validationRegex?: string;
  validationErrorMessage?: string;
  immutable?: boolean;
  example?: string;
}

export enum ParamType {
  STRING = 'STRING',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  SECRET = 'SECRET',
}

export interface ParamOption {
  value: string;
  label?: string;
}
