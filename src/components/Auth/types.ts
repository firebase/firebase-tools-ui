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
}

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

export interface AuthState {
  authUserDialogData?: RemoteResult<AuthUser | undefined>;
  users: RemoteResult<AuthUser[]>;
  filter: string;
  allowDuplicateEmails: boolean;
}
