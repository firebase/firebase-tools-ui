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

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Simple REST api helpers */
export abstract class RestApi {
  protected async getToken() {
    return { accessToken: 'owner' };
  }

  protected async jsonRequest(
    url: string,
    data: {},
    method: RequestMethod = 'GET'
  ) {
    const { accessToken } = await this.getToken();

    const res = await fetch(url, {
      method,
      body: JSON.stringify(data),
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    return { res, json };
  }

  /** Upload a file with multipart/form-data */
  protected async postFile(
    url: string,
    file: File,
    method: RequestMethod = 'POST'
  ) {
    const body = toFormData(file);

    const { accessToken } = await this.getToken();
    body.append('auth', accessToken);

    const res = await fetch(url, { method, body });

    const text = await res.text();
    return { res, text };
  }
}

/** build `multipart/form-data` payload */
function toFormData(file: File) {
  const formData = new FormData();
  formData.append('upload', file);
  return formData;
}