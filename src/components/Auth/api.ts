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
import { AddAuthUserPayload, AuthUser } from './types';

// curl -X POST http://localhost:5002/identitytoolkit.googleapis.com/v1/projects/sample/accounts:query -H 'Authorization: Bearer owner' -d "{}" -H 'Content-Type: application/json'
// curl -X POST http://localhost:5002/identitytoolkit.googleapis.com/v1/projects/sample/config:update -H 'Authorization: Bearer owner' -d "{}" -H 'Content-Type: application/json'
// curl -X PATCH http://localhost:5002/emulator/v1/projects/sample/config -H 'Authorization: Bearer owner' -d "{}" -H 'Content-Type: application/json'
// "/v1/accounts:signUp"
// "/v1/accounts:update"
// "/v1/projects/{targetProjectId}/accounts:delete"
// "/emulator/v1/projects/{targetProjectId}/accounts"
// allowDuplicateEmails

export default class AuthApi extends RestApi {
  readonly baseUrl = `http://${this.hostAndPort}/identitytoolkit.googleapis.com/v1/`;
  readonly baseUrlWithProject =
    this.baseUrl + `projects/${this.projectId}/accounts:`;
  readonly baseUrlWithoutProject = this.baseUrl + `accounts:`;
  readonly baseEmulatorUrl = `http://${this.hostAndPort}/emulator/v1/projects/${this.projectId}`;

  constructor(
    public readonly hostAndPort: string,
    public readonly projectId: string
  ) {
    super();
  }

  async nukeUsers() {
    await this.deleteRequest(`${this.baseEmulatorUrl}/accounts`);
    return [];
  }

  private async fetchUsers(): Promise<AuthUser[]> {
    const { json } = await this.jsonRequest(
      `${this.baseUrlWithProject}query`,
      {
        fields: ['displayName'],
      },
      'POST'
    );
    return json.userInfo.map((u: any) => {
      return u;
    });
  }

  private async createUser(user: AddAuthUserPayload): Promise<AuthUser> {
    const { json } = await this.jsonRequest(
      `${this.baseUrlWithoutProject}signUp`,
      { ...user },
      'POST'
    );

    return json;
  }

  private async updateConfig(allowDuplicateEmails: boolean): Promise<AuthUser> {
    const { json } = await this.patchRequest(`${this.baseEmulatorUrl}/config`, {
      signIn: { allowDuplicateEmails },
    });

    return json;
  }

  private async getConfig(allowDuplicateEmails: boolean): Promise<AuthUser> {
    const { signIn } = await (
      await fetch(`${this.baseEmulatorUrl}/config`)
    ).json();

    return signIn.allowDuplicateEmails;
  }

  private async updateUser(user: AddAuthUserPayload): Promise<AuthUser> {
    const { json } = await this.jsonRequest(
      `${this.baseUrlWithoutProject}update`,
      user,
      'POST'
    );

    return json;
  }

  private async deleteUser(user: AddAuthUserPayload): Promise<AuthUser> {
    const { json } = await this.jsonRequest(
      `${this.baseUrlWithoutProject}delete`,
      user,
      'POST'
    );

    return json;
  }
}
