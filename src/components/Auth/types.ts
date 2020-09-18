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

export interface AuthUser extends AddAuthUserPayload {
  localId: string;
  createdAt: string;
  lastLoginAt?: Date;
  disabled: boolean;
}

export interface AuthState {
  users: AuthUser[];
  filter: string;
  allowDuplicateEmails: boolean;
}
