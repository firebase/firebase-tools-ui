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
import { Redirect, useLocation, useRouteMatch } from 'react-router-dom';

/**
 * Given a list of collections or documents, auto select the first item. Only
 * works on root (`/firestore/DB/data`) or top level collections (`/firestore/DB/data/users`)
 * to prevent deep auto selection.
 */
export function useAutoSelect<T extends { id: string }>(list?: T[] | null) {
  const { url } = useRouteMatch()!;
  const { pathname } = useLocation();
  const [autoSelect, setAutoSelect] = useState<ReactNode | null>(null);

  useEffect(() => {
    const splitUrl = url.split('/');
    const isRootOrRootCollection =
      (splitUrl.length === 4 || splitUrl.length === 5)
      && splitUrl[1] === "firestore" // The first segment is empty string
      && splitUrl[3] === "data";
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
