/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO(tjlav5): re-enable name-types when new babel version lands

// export type ExtensionName = `publishers/${string}/extensions/${string}`;

// export type ExtensionRef = `${string}/${string}`;

export interface BackendExtension {
  name: string; // ExtensionName;
  ref: string; // ExtensionRef;
  visibility: Visibility;
  registryLaunchStage: RegistryLaunchStage;
  createTime: string;
  latestVersion?: string;
  latestVersionCreateTime?: string;
  iconUri?: string;
  publisher?: PublisherSummary;
}

export enum RegistryLaunchStage {
  EXPERIMENTAL = 'EXPERIMENTAL',
  BETA = 'BETA',
  GA = 'GA',
  DEPRECATED = 'DEPRECATED',
  REGISTRY_LAUNCH_STAGE_UNSPECIFIED = 'REGISTRY_LAUNCH_STAGE_UNSPECIFIED',
}

export enum Visibility {
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

export interface PublisherSummary {
  displayName: string;
  iconUri?: string;
}

// export type ExtensionVersionName = `${ExtensionName}/versions/${string}`;

// export type ExtensionVersionRef = `${ExtensionRef}@${string}`;

export interface ExtensionVersion {
  name: string; // ExtensionVersionName;
  ref: string; // ExtensionVersionRef;
  state: 'STATE_UNSPECIFIED' | 'PUBLISHED' | 'DEPRECATED';
  spec: ExtensionSpec;
  hash: string;
  sourceDownloadUri: string;
  releaseNotes?: string;
  createTime?: string;
  deprecationMessage?: string;
}

// export type ExtensionInstanceName = `projects/${string}/instances/${string}`;

export interface ExtensionInstance {
  name: string; // ExtensionInstanceName;
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

// export type ExtensionInstanceConfigName = `${ExtensionInstanceName}/configs/${string}`;

export interface ExtensionInstanceConfig {
  name: string; // ExtensionInstanceConfigName;
  createTime: string;
  source: ExtensionSource;
  params: {
    [key: string]: any;
  };
  populatedPostinstallContent?: string;
  extensionRef?: string;
  extensionVersion?: string;
}

// export type ExtensionSourceName = `projects/${string}/sources/${string}`;

export interface ExtensionSource {
  name: string; // ExtensionSourceName;
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
  params: Param[];
  preinstallContent?: string;
  postinstallContent?: string;
  readmeContent?: string;
  sourceUrl?: string;
  externalServices?: ExternalService[];
}

export interface ExtensionParam extends Param {
  value: string;
}

export interface Extension {
  iconUri?: string;
  publisherIconUri?: string;
  id: string;
  ref?: string;
  authorName: string;
  authorUrl: string;
  apis?: Api[];
  roles?: Role[];
  resources?: ExtensionResource[];
  params?: ExtensionParam[];
  displayName: string;
  specVersion: string;
  readmeContent: string;
  sourceUrl: string;
  postinstallContent: string;
  extensionDetailsUrl: string;
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

export interface ExtensionResource extends Resource {
  functionName?: string;
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

export interface FunctionTrigger {
  entryPoint: string;
  regions: string[];
  name: string;
}
