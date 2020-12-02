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
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { canDoRealtime, createViewModel } from './common/fetch';
import {
  DEFAULT_QUERY_PARAMS,
  QueryParams,
  ViewModel,
} from './common/view_model';
import { NodeLeaf } from './NodeLeaf';
import { NodeParent } from './NodeParent';

export interface Props {
  realtimeRef: firebase.database.Reference;
  /**
   * This node is the top most visible node in viewer (not the same as the real
   * db root). It will show breadcrumbs of all hidden parent nodes to the root.
   */
  isViewRoot?: boolean;
}

const initialState: ViewModel = {
  isLoading: true,
  children: [],
};

export const NodeContainer = React.memo<Props>(function NodeContainer$({
  realtimeRef,
  isViewRoot,
}) {
  const [viewModel, setViewModel] = useState<ViewModel>(initialState);
  const [querySubject, setQuerySubject] = useState<
    Subject<QueryParams> | undefined
  >(undefined);

  useEffect(() => {
    const canDoRealtime$ = canDoRealtime(realtimeRef);
    const { query, viewModel$ } = createViewModel(realtimeRef, canDoRealtime$);
    setQuerySubject(query);
    const sub = viewModel$.subscribe(vm => setViewModel(vm));
    return () => sub.unsubscribe();
  }, [realtimeRef]);

  const updateQuery = (q: QueryParams) => {
    setQueryParams(q);
    querySubject && querySubject.next(q);
  };

  const [queryParams, setQueryParams] = useState(DEFAULT_QUERY_PARAMS);

  const { children, query } = viewModel;
  const hasChildren = !!children.length;
  const isFiltered = queryParams !== DEFAULT_QUERY_PARAMS;
  return !hasChildren && !isFiltered ? (
    <NodeLeaf realtimeRef={realtimeRef} value={viewModel.value!} />
  ) : (
    <NodeParent
      realtimeRef={realtimeRef}
      children={children}
      queryParams={queryParams}
      updateQuery={updateQuery}
      isViewRoot={isViewRoot}
      query={query}
    />
  );
});
