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

import { RemoteResult } from '../../store/utils';

/** View model for Auth custom attributes */
export interface CustomAttribute {
  role: string;
  value: string;
}

/**
 * Field names are consistent with:
 * https://github.com/firebase/firebase-tools/blob/f413eb9eb6940ee20dea748b18bb25ce185e7d7f/src/emulator/auth/schema.ts#L617
 */
export type MfaEnrollment = {
  displayName?: string;
  enrolledAt?: string;
  mfaEnrollmentId?: string;
  phoneInfo?: string;
  unobfuscatedPhoneInfo?: string;
};

/**
 * Field names are consistent with:
 * https://github.com/firebase/firebase-tools/blob/a8ccc7afec817389a7ab5565a1bbf59f24bd68bd/src/emulator/auth/schema.ts#L1724-L1833
 */
export interface AddAuthUserPayload {
  customAttributes?: string;
  displayName?: string;
  photoUrl?: string;
  screenName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  mfaInfo?: MfaEnrollment[];
}

// `mfaInfo` name is changed to `mfa.enrollments` only for user update:
// https://github.com/firebase/firebase-tools/blob/a8ccc7afec817389a7ab5565a1bbf59f24bd68bd/src/emulator/auth/schema.ts#L932
export type UpdateAuthUserPayload = Omit<AddAuthUserPayload, 'mfaInfo'> & {
  mfa?: { enrollments: MfaEnrollment[] };
};

export type AuthFormUser = AddAuthUserPayload & {
  mfaEnabled?: boolean;
  mfaPhoneInfo: { phoneInfo?: string }[];
};

export const providerToIconMap = {
  'gc.apple.com': 'assets/provider-icons/auth_service_game_center.svg',
  'apple.com': 'assets/provider-icons/auth_service_apple.svg',
  'facebook.com': 'assets/provider-icons/auth_service_facebook.svg',
  'github.com': 'assets/provider-icons/auth_service_github.svg',
  'google.com': 'assets/provider-icons/auth_service_google.svg',
  'microsoft.com': 'assets/provider-icons/auth_service_mslive.svg',
  'playgames.google.com': 'assets/provider-icons/auth_service_play_games.svg',
  'twitter.com': 'assets/provider-icons/auth_service_twitter.svg',
  'yahoo.com': 'assets/provider-icons/auth_service_yahoo.svg',
  phone: 'assets/provider-icons/auth_service_phone.svg',
  password: 'assets/provider-icons/auth_service_email.svg',
  oidc: 'assets/provider-icons/auth_service_oidc.svg',
  saml: 'assets/provider-icons/auth_service_saml.svg',
};

export interface AuthProviderInfo {
  providerId: keyof typeof providerToIconMap;
}

export interface AuthUser extends AddAuthUserPayload {
  localId: string;
  createdAt: string;
  lastLoginAt: string;
  disabled: boolean;
  providerUserInfo: AuthProviderInfo[];
}

export interface Tenant {
  allowPasswordSignup: boolean;
  disableAuth: boolean;
  enableAnonymousUser: boolean;
  enableEmailLinkSignin: boolean;
  mfaConfig: { state: string; enabledProviders: string[] };
  name: string;
  tenantId: string;
}

export interface AuthState {
  authUserDialogData?: RemoteResult<AuthUser | undefined>;
  users: RemoteResult<AuthUser[]>;
  filter: string;
  allowDuplicateEmails: boolean;
  customAuthActionUri: string;
  tenants: RemoteResult<Tenant[]>;
}

// Similar the emulator config object of the same name in the Firebase CLI,
// but without optional types
export interface EmulatorV1ProjectsConfig {
  signIn: { allowDuplicateEmails: boolean };
  notification: { sendEmail: { callbackUri: string } };
}
