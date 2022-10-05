/**
 * Copyright 2019 Google LLC
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

import { RestApi } from '../common/rest_api';
import {
  AddAuthUserPayload,
  AuthUser,
  EmulatorV1ProjectsConfig,
  Tenant,
  UpdateAuthUserPayload,
} from './types';

const importUser = (user: AuthUser & ApiAuthUserFields) => {
  const match = user.passwordHash?.match(PASSWORD_HASH_REGEX);

  return {
    password: match ? match[1] : '',
    ...user,
    providerUserInfo: user.providerUserInfo || [],
  };
};

export interface ApiAuthUserFields {
  passwordHash: string;
}

export default class AuthApi extends RestApi {
  // Note: Always use API paths that contain `projectId` for consistency.
  // Unprefixed versions (e.g. /v1/accounts:signUp) are intended for non-admin
  // clients and infers projectId, which can lead to unexpected mismatches.

  // https://cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts
  private readonly baseUrl: string;
  private readonly baseUrlV2: string;
  private readonly baseEmulatorUrl: string;

  constructor(
    private readonly hostAndPort: string,
    private readonly projectId: string,
    private readonly tenantId?: string
  ) {
    super();
    // https://cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts
    this.baseUrl = `//${this.hostAndPort}/identitytoolkit.googleapis.com/v1/projects/${this.projectId}`;
    this.baseUrlV2 = `//${this.hostAndPort}/identitytoolkit.googleapis.com/v2/projects/${this.projectId}`;
    this.baseEmulatorUrl = `//${this.hostAndPort}/emulator/v1/projects/${this.projectId}`;
  }

  async nukeUsersForAllTenants(): Promise<void> {
    const deletePromises = [];

    // clear users from default tenant
    deletePromises.push(this.deleteRequest(`${this.baseEmulatorUrl}/accounts`));

    // clear users from all other tenants
    const tenants = await this.fetchTenants();
    const tenantDeletes = tenants.map(({ tenantId }) => {
      return this.deleteRequest(
        `${this.baseEmulatorUrl}/tenants/${tenantId}/accounts`
      );
    });
    deletePromises.concat(tenantDeletes);

    await Promise.all(deletePromises);
  }

  async nukeUsers() {
    if (this.tenantId) {
      await this.deleteRequest(
        `${this.baseEmulatorUrl}/tenants/${this.tenantId}/accounts`
      );
    } else {
      await this.deleteRequest(`${this.baseEmulatorUrl}/accounts`);
    }

    return [];
  }

  async fetchUsers(): Promise<AuthUser[]> {
    const { json } = await this.jsonRequest(
      `${this.baseUrl}/accounts:query`,
      { tenantId: this.tenantId },
      'POST'
    );

    return json.userInfo.map(importUser);
  }

  async fetchTenants(): Promise<Tenant[]> {
    const { json } = await this.jsonRequest(`${this.baseUrlV2}/tenants`);
    return json.tenants;
  }

  async fetchUser(localId: string): Promise<AuthUser> {
    const { json } = await this.jsonRequest(
      `${this.baseUrl}/accounts:lookup`,
      { localId: [localId], tenantId: this.tenantId },
      'POST'
    );

    if (!json.users || !json.users.length) {
      throw new Error(
        `User "${localId}" not found in Project "${this.projectId}"!`
      );
    }
    return importUser(json.users[0]);
  }

  async createUser(user: AddAuthUserPayload): Promise<AuthUser> {
    const { json } = await this.jsonRequest(
      `${this.baseUrl}/accounts`,
      { ...user, tenantId: this.tenantId },
      'POST'
    );

    return this.fetchUser(json.localId);
  }

  async updateConfig(
    newConfig: Partial<EmulatorV1ProjectsConfig>
  ): Promise<EmulatorV1ProjectsConfig> {
    const { json: updatedConfig } = await this.patchRequest(
      `${this.baseEmulatorUrl}/config`,
      newConfig
    );
    return updatedConfig;
  }

  async getConfig(): Promise<EmulatorV1ProjectsConfig> {
    const config = await (await fetch(`${this.baseEmulatorUrl}/config`)).json();
    return config;
  }

  async updateUser(
    user: AddAuthUserPayload & { localId: string }
  ): Promise<AuthUser> {
    // AddAuthUserPayload isn't always a valid update payload.
    // Convert to valid update payload.
    const userUpdate: UpdateAuthUserPayload = {
      ...user,
      mfa: user.mfaInfo ? { enrollments: user.mfaInfo } : undefined,
    };

    const { json } = await this.jsonRequest(
      `${this.baseUrl}/accounts:update`,
      { ...userUpdate, tenantId: this.tenantId },
      'POST'
    );

    return this.fetchUser(json.localId);
  }

  async deleteUser(user: AuthUser): Promise<void> {
    await this.jsonRequest(
      `${this.baseUrl}/accounts:delete`,
      { ...user, tenantId: this.tenantId },
      'POST'
    );
  }
}

const PASSWORD_HASH_REGEX = /^fakeHash:salt=[\w\d]+:password=(.*)$/;
