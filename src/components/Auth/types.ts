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
 * https://github.com/FirebasePrivate/firebase-tools/blob/d6b584da9f852313064d32dd219a6f23b7800d66/src/emulator/auth/schema.ts#L1670-L1779
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

// `mfaInfo` name is changed to `mfa` only for user update:
// https://github.com/FirebasePrivate/firebase-tools/blob/d6b584da9f852313064d32dd219a6f23b7800d66/src/emulator/auth/schema.ts#L879
export type UpdateAuthUserPayload = Omit<AddAuthUserPayload, 'mfaInfo'> & {
  mfa?: { enrollments: MfaEnrollment[] };
};

// The form library can't handle booleans or object arrays,
// so we need to change the types to something the form supports
export type AuthFormUser = Omit<AddAuthUserPayload, 'emailVerified'> & {
  emailVerified: [] | ['on'];
  mfaEnabled: [] | ['on'];
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

export enum UsageMode {
  // We shouldn't ever get this usage mode
  USAGE_MODE_UNSPECIFIED = 'USAGE_MODE_UNSPECIFIED',
  // Passthrough mode is off
  DEFAULT = 'DEFAULT',
  // Passthrough mode is on
  PASSTHROUGH = 'PASSTHROUGH',
}

export interface AuthState {
  authUserDialogData?: RemoteResult<AuthUser | undefined>;
  users: RemoteResult<AuthUser[]>;
  filter: string;
  allowDuplicateEmails: boolean;
  usageMode: UsageMode;
}

// Similar the emulator config object of the same name in the Firebase CLI,
// but without optional types
export interface EmulatorV1ProjectsConfig {
  signIn: { allowDuplicateEmails: boolean };
  usageMode: UsageMode;
}
