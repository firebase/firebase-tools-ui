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

import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { getDbRootUrl } from './common/view_model';

export interface Props {
  dbRef: firebase.database.Reference;
  /**
   * This node is the top most visible node in viewer (not the same as the real
   * db root). It will show breadcrumbs of all hidden parent nodes to the root.
   */
  isViewRoot?: boolean;
  baseUrl: string;
}

export const NodeParentKey = React.memo<Props>(function NodeParentKey$({
  dbRef,
  isViewRoot,
  baseUrl,
}) {
  if (isViewRoot) {
    return renderBreadcrumbs(baseUrl, dbRef);
  }

  const key = dbRef.parent === null ? getDbRootUrl(dbRef) : dbRef.key;
  const path = new URL(dbRef.toString()).pathname;
  const href = `${baseUrl}${path}`;
  return (
    <Typography
      className="NodeParent__key"
      use="body1"
      aria-label="Key name"
      tag={props => <Link to={href} {...props} />}
    >
      {key}
    </Typography>
  );
});

function renderBreadcrumbs(
  baseUrl: string,
  activeRef: firebase.database.Reference
) {
  const ancestors = getAncestorRefs(activeRef);

  let crumbs: JSX.Element[] = [];
  for (let [i, ref] of ancestors.entries()) {
    const reactKey = ref.toString();
    if (i !== 0) {
      crumbs.push(<Icon icon="chevron_right" key={`${reactKey}-chevron`} />);
    }
    const path = new URL(ref.toString()).pathname;
    const href = `${baseUrl}${path}`;
    crumbs.push(
      <Typography
        key={reactKey}
        className="NodeParent__key"
        use="body1"
        aria-label="Key name"
        tag={props => <Link to={href} {...props} />}
      >
        {ref.key || getDbRootUrl(ref)}
      </Typography>
    );
  }
  return <>{crumbs}</>;
}

/**
 * Get the all parent refs, in order, from the root to the supplied ref.
 *
 * Example:
 *
 * ```
 * const ref = new Database('http://example.firebaseio.com/a/b/c');
 *
 * getAncestorRefs(ref); // [refA, refB, refC]
 * ```
 */
function getAncestorRefs(ref: firebase.database.Reference | null) {
  const refs = [];
  while (ref !== null) {
    refs.push(ref);
    ref = ref.parent;
  }
  refs.reverse();
  return refs;
}
