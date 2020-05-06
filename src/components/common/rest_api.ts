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

const JSON_TYPE = 'application/json';

/** Simple REST api helpers */
export abstract class RestApi {
  protected async getToken() {
    return { accessToken: 'owner' };
  }

  protected async restRequest(
    url: string,
    data: BodyInit | {},
    method: RequestMethod = 'GET',
    contentType = JSON_TYPE
  ) {
    const { accessToken } = await this.getToken();

    const body: BodyInit =
      contentType === JSON_TYPE ? JSON.stringify(data) : (data as BodyInit);

    const contentTypeHeaders: HeadersInit =
      data instanceof FormData ? {} : { 'Content-Type': contentType };

    const res = await fetch(url, {
      method,
      body,
      headers: {
        // Authorization: 'Bearer ' + accessToken,
        ...contentTypeHeaders,
      },
    });
    const json = await res.json();
    return { res, json };
  }
}
