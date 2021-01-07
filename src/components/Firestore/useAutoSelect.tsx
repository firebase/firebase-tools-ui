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

import { ReactNode, useEffect, useState } from 'react';
import React from 'react';
import { Redirect, useLocation, useRouteMatch } from 'react-router-dom';

export const FIRESTORE_DATA_URL = '/firestore/data';
const FIRESTORE_DATA_URL_PATH_LENGTH = FIRESTORE_DATA_URL.split('/').length;

/**
 * Given a list of collections or documents, auto select the first item. Only
 * works on root (`/firestore/data`) or top level collections (`/firestore/data/users`)
 * to prevent deep auto selection.
 */
export function useAutoSelect<T extends { id: string }>(list?: T[] | null) {
  const { url } = useRouteMatch()!;
  const { pathname } = useLocation();
  const [autoSelect, setAutoSelect] = useState<ReactNode | null>(null);

  useEffect(() => {
    const isRootOrRootCollection =
      url === FIRESTORE_DATA_URL ||
      // /firestore/data/users
      (url.startsWith(FIRESTORE_DATA_URL) &&
        url.split('/').length === FIRESTORE_DATA_URL_PATH_LENGTH + 1);
    const hasNothingSelected = url === pathname;
    const firstChild = list?.[0];
    const shouldAutoSelect = isRootOrRootCollection && hasNothingSelected;

    setAutoSelect(
      shouldAutoSelect && firstChild ? (
        <Redirect to={`${url}/${encodeURIComponent(firstChild.id)}`} />
      ) : null
    );
  }, [pathname, url, list, setAutoSelect]);

  return autoSelect;
}
