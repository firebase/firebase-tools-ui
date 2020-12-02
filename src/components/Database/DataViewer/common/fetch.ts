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

import firebase from 'firebase';
import { Observable, ReplaySubject, defer, from, of } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  mapTo,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import {
  DEFAULT_PAGE_SIZE,
  QueryParams,
  ViewModel,
  getDbRootUrl,
} from './view_model';

/**
 * Timeout for silent call, which should determine if the data is
 * safely loadable at the current node
 */
const REST_TIMEOUT = `1s`;

const NO_CHILDREN: string[] = [];

// Accepted as admin by Realtime Database Emulator.
const ADMIN_AUTH_HEADERS = { Authorization: 'Bearer owner' };

/**
 * Creates an observable view model and query subject. The view model will
 * update when the query emits/changes.
 */
export function createViewModel(
  ref: firebase.database.Reference,
  canDoRealtime$: Observable<boolean>
) {
  const query = new ReplaySubject<QueryParams>(1);
  query.next({ limit: DEFAULT_PAGE_SIZE });
  const viewModel$ = query.pipe(
    switchMap(queryParams => {
      return canDoRealtime$.pipe(
        concatMap(realtime =>
          realtime
            ? realtimeToViewModel(ref, queryParams)
            : nonRealtimeToViewModel(ref, queryParams)
        )
      );
    })
  );
  return { query, viewModel$ };
}

/**
 * Checks if realtime is possible at the node. Only checks once for the current
 * node.
 */
export function canDoRealtime(
  realtimeRef: firebase.database.Reference
): Observable<boolean> {
  const silent = restUrl(realtimeRef, {
    print: 'silent',
    timeout: REST_TIMEOUT,
  });
  return defer(() => fetch(silent, { headers: ADMIN_AUTH_HEADERS })).pipe(
    mapTo(true),
    catchError(() => of(false)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}

function realtimeToViewModel(
  ref: firebase.database.Reference,
  queryParams: QueryParams
) {
  let query: firebase.database.Query;
  return once(ref).pipe(
    switchMap(snap => {
      // The "default" query contains limitToFirst(50), so we can not blindly
      // apply the query to leaf nodes. leafNodeRef.limitToFirst(n) will yield
      // null data.
      if (snap.hasChildren()) {
        query = applyQuery(ref, queryParams);
        return toObservable(query);
      }
      return toObservable(ref);
    }),
    map(
      (snap): ViewModel => ({
        value: snap.hasChildren() ? undefined : snap.val(),
        children: snap.hasChildren() ? Object.keys(snap.val()) : NO_CHILDREN,
        isRealtime: true,
        isLoading: false,
        query,
      })
    )
  );
}

function nonRealtimeToViewModel(
  ref: firebase.database.Reference,
  queryParams: QueryParams
): Observable<ViewModel> {
  return fetchNonRealtime(ref, queryParams).pipe(
    map(
      (children): ViewModel => ({
        children,
        isLoading: false,
        isRealtime: false,
      })
    )
  );
}

function once(query: firebase.database.Query) {
  return from(query.once('value'));
}

function toObservable(query: firebase.database.Query) {
  return new Observable<firebase.database.DataSnapshot>(o => {
    const handler = query.on('value', snapshot => o.next(snapshot));
    return () => query.off('value', handler);
  });
}

export function applyQuery(
  ref: firebase.database.Reference,
  params: QueryParams
): firebase.database.Query {
  const { key, operator, value, limit } = params;
  // Check the existence value instead of it being falsy. This prevents bugs
  // where the "value" is actually false.
  // ex: { key: "completed", operator: "==", value: "false" }
  if (key != null && operator != null && value != null) {
    let query = ref.orderByChild(key).limitToFirst(limit || DEFAULT_PAGE_SIZE);
    switch (operator) {
      case '==':
        return query.equalTo(value);
      case '<=':
        return query.endAt(value);
      case '>=':
        return query.startAt(value);
    }
  }
  return ref.limitToFirst(limit || DEFAULT_PAGE_SIZE);
}

/** Use REST to fetch the children for a node */
function fetchNonRealtime(
  realtimeRef: firebase.database.Reference,
  query: QueryParams
): Observable<string[]> {
  const params = getRestQueryParams(query);
  const shallow = restUrl(realtimeRef, { ...params, shallow: 'true' });
  return defer(() => fetch(shallow, { headers: ADMIN_AUTH_HEADERS })).pipe(
    map(r => r.json()),
    map(data => Object.keys(data))
  );
}

interface RestQueryParams {
  orderBy?: string;
  limitToFirst: string;
  equalTo?: string;
  endAt?: string;
  startAt?: string;
}

function getRestQueryParams(query: QueryParams): RestQueryParams {
  const { key, operator, value, limit } = query;

  const params: RestQueryParams = {
    orderBy: key,
    limitToFirst: `${limit || DEFAULT_PAGE_SIZE}`,
  };

  if (key && operator && value) {
    switch (operator) {
      case '==':
        params.equalTo = value;
        break;
      case '<=':
        params.endAt = value;
        break;
      case '>=':
        params.startAt = value;
        break;
    }
  }

  return params;
}

function restUrl(
  ref: firebase.database.Reference,
  params: Record<string, string | undefined>
): string {
  const rootUrl = getDbRootUrl(ref);

  // TODO(yuchenshi): Find some cross-browser and lightweight way to parse query.
  if (rootUrl.indexOf('?ns=') >= 0) {
    const ns = rootUrl.split('?ns=')[1];
    params = { ...params, ns };
  }

  const query = Object.entries(params)
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
    .join('&');
  return `${ref.toString()}.json?${query}`;
}
