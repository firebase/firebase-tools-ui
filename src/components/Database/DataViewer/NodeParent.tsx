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

import './NodeParent.scss';

import { Button } from '@rmwc/button';
import firebase from 'firebase';
import * as React from 'react';
import { useCallback, useState } from 'react';

import {
  ChildrenDisplayType,
  DEFAULT_PAGE_SIZE,
  QueryParams,
} from './common/view_model';
import { NodeActions } from './NodeActions';
import { NodeContainer } from './NodeContainer';
import { NodeLink } from './NodeLink';
import { NodeTabularDisplay } from './NodeTabularDisplay';

export interface Props {
  realtimeRef: firebase.database.Reference;
  children: string[];
  isRealtime?: boolean;
  queryParams?: QueryParams;
  /**
   * This node is the top most visible node in viewer (not the same as the real
   * db root). It will show breadcrumbs of all hidden parent nodes to the root.
   */
  isViewRoot?: boolean;
  updateQuery?: (params: QueryParams) => void;
  query?: firebase.database.Query;
}

export const NodeParent = React.memo<Props>(function NodeParent$({
  realtimeRef,
  children,
  queryParams,
  updateQuery,
  isViewRoot,
  query,
}) {
  const isRoot = realtimeRef.parent === null;
  const hasChildren = !!children.length;
  const [isExpanded, setIsExpanded] = useState(
    isRoot || isViewRoot ? true : false
  );
  const [displayType, setDisplayType] = useState(ChildrenDisplayType.TreeView);

  const hasMore =
    queryParams && queryParams.limit
      ? children.length >= queryParams.limit
      : children.length >= DEFAULT_PAGE_SIZE;

  const loadMore = () => {
    const currentPageSize = queryParams
      ? queryParams.limit || DEFAULT_PAGE_SIZE
      : DEFAULT_PAGE_SIZE;
    updateQuery &&
      updateQuery({
        ...queryParams,
        limit: currentPageSize + DEFAULT_PAGE_SIZE,
      });
  };

  const toggleExpansion = useCallback(() => setIsExpanded(!isExpanded), [
    setIsExpanded,
    isExpanded,
  ]);

  return (
    <div className="NodeParent">
      {/* Label */}
      <div className="NodeParent__label">
        {isExpanded ? (
          <button
            className="NodeParent__tree-button material-icons"
            aria-label="less"
            onClick={toggleExpansion}
          >
            arrow_drop_down
          </button>
        ) : (
          <button
            className="NodeParent__tree-button material-icons"
            aria-label="more"
            onClick={toggleExpansion}
          >
            arrow_right
          </button>
        )}
        <NodeLink dbRef={realtimeRef} />
        <NodeActions
          realtimeRef={realtimeRef}
          displayType={displayType}
          onDisplayTypeChange={type => {
            setDisplayType(type);
            setIsExpanded(true);
          }}
          onExpandRequested={() => setIsExpanded(true)}
          queryParams={queryParams}
          updateQuery={updateQuery}
        />
      </div>
      <div className="NodeParent__children-container">
        {hasChildren &&
          isExpanded &&
          (displayType === ChildrenDisplayType.Table ? (
            <NodeTabularDisplay
              query={query || realtimeRef}
              hasMoreRows={hasMore}
              onLoadMore={loadMore}
            />
          ) : (
            <ul className="NodeParent__children">
              {children.map(key => (
                <li key={key}>
                  <NodeContainer realtimeRef={realtimeRef.child(key)} />
                </li>
              ))}
              {hasMore && (
                <li className="load-more">
                  <Button onClick={loadMore}>Load more...</Button>
                </li>
              )}
            </ul>
          ))}
      </div>
    </div>
  );
});
