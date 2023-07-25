/**
 * Copyright 2020 Google LLC
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

export interface EmulatorConfig {
  hostAndPort: string;
  host: string;
  port: number;
}

export interface DatabaseConfig extends EmulatorConfig {}

export interface FirestoreConfig extends EmulatorConfig {
  webSocketHost?: string;
  webSocketPort?: number;
}

export interface FunctionsConfig extends EmulatorConfig {}

export interface LoggingConfig extends EmulatorConfig {}

export interface AuthConfig extends EmulatorConfig {}

export type Emulator =
  | 'database'
  | 'auth'
  | 'firestore'
  | 'functions'
  | 'logging'
  | 'hosting'
  | 'storage'
  | 'pubsub'
  | 'extensions';

// Config for the Emulator Suite UI's own analytics (not a Google Analytics emulator)
// See also: https://github.com/FirebasePrivate/firebase-tools/blob/3e6f525717f546c64f9943f6b3e045772fbf637f/src/track.ts#L167-L187
export interface AnalyticsSession {
  measurementId: string;
  clientId: string;

  // https://support.google.com/analytics/answer/9191807
  // Inherited from the CLI invocation (i.e. reusing the same session).
  sessionId: string;

  // Currently unused in Emulator UI. The GA library automatically tracks this.
  totalEngagementSeconds: number;

  // Whether the events sent should be tagged so that they are shown in GA Debug
  // View in real time (for Googler to debug) and excluded from reports.
  debugMode: boolean;

  // Whether to validate events format instead of collecting them. Should only
  // be used to debug the Firebase CLI / Emulator UI itself regarding issues
  // with Analytics. To enable, set the env var FIREBASE_CLI_MP_VALIDATE in CLI.
  // In Emulator UI, this is implemented by marking events sent as model-only.
  // See: https://support.google.com/analytics/answer/11161109
  validateOnly: boolean;
}

export interface Config {
  projectId: string;
  analytics?: AnalyticsSession;
  database?: DatabaseConfig;
  auth?: AuthConfig;
  firestore?: FirestoreConfig;
  functions?: FunctionsConfig;
  extensions?: EmulatorConfig;
  logging?: LoggingConfig;
  hosting?: EmulatorConfig;
  storage?: EmulatorConfig;
  pubsub?: EmulatorConfig;
  experiments: Array<string>;
}
