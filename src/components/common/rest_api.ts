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

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class ResponseError extends Error {
  constructor(
    message: string,
    readonly response: Response,
    readonly json?: {}
  ) {
    super(message);
  }
}

/** Simple REST api helpers */
export abstract class RestApi {
  protected getToken() {
    return { accessToken: 'owner' };
  }

  protected async jsonRequest(
    url: string,
    data: {},
    method: RequestMethod = 'GET',
    headers: Record<string, string> = { 'Content-Type': 'application/json' }
  ) {
    const { accessToken } = this.getToken();

    const res = await fetch(url, {
      method,
      body: JSON.stringify(data),
      headers: {
        Authorization: 'Bearer ' + accessToken,
        ...headers,
      },
    });

    const json = await res.json();

    if (res.status >= 400 && res.status < 600) {
      throw new ResponseError(json.error.message, res, json);
    }

    return { res, json };
  }

  protected async deleteRequest(url: string) {
    const { accessToken } = this.getToken();

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    const json = await res.json();

    if (res.status >= 400 && res.status < 600) {
      throw new ResponseError(json.error.message, res, json);
    }

    return { res, json };
  }

  protected async patchRequest(url: string, data: {}) {
    return this.jsonRequest(url, data, 'PATCH');
  }

  /** Upload a file with multipart/form-data */
  protected async postFile(
    url: string,
    file: File,
    method: RequestMethod = 'POST'
  ) {
    const body = toFormData(file);

    const { accessToken } = this.getToken();
    body.append('auth', accessToken);

    // We cannot set the Content-Type header here, since that will
    // break multipart/form-data payload.
    // Furthermore, setting non-simple headers may cause a CORS pre-flight
    // request. RTDB Emulator, for one, doesn't handle those correctly.
    // See: https://fetch.spec.whatwg.org/#simple-header
    const res = await fetch(url, { method, body });

    const text = await res.text();

    if (res.status >= 400 && res.status < 600) {
      throw new ResponseError(text, res);
    }

    return { res, text };
  }
}

/** build `multipart/form-data` payload */
function toFormData(file: File) {
  const formData = new FormData();
  formData.append('upload', file);
  return formData;
}
