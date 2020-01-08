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

import * as React from 'react';
import { Typography } from '@rmwc/typography';
import { Icon } from '@rmwc/icon';
import { getDbRootUrl } from './common/view_model';

export interface Props {
  dbRef: firebase.database.Reference;
  /**
   * This node is the top most visible node in viewer (not the same as the real
   * db root). It will show breadcrumbs of all hidden parent nodes to the root.
   */
  isViewRoot?: boolean;
  onNavigate: (path: string) => void;
}

export const NodeParentKey = React.memo<Props>(function NodeParentKey$({
  dbRef,
  isViewRoot,
  onNavigate,
}) {
  const navigateToRef = (ref: firebase.database.Reference) => {
    const path = new URL(ref.toString()).pathname;
    onNavigate(path);
  };

  if (isViewRoot) {
    return renderBreadcrumbs(dbRef, navigateToRef);
  }

  const key = dbRef.parent === null ? getDbRootUrl(dbRef) : dbRef.key;
  return (
    <Typography
      className="NodeParent__key"
      use="body1"
      aria-label="Key name"
      onClick={() => navigateToRef(dbRef)}
    >
      {key}
    </Typography>
  );
});

function renderBreadcrumbs(
  activeRef: firebase.database.Reference,
  navigateToRef: (ref: firebase.database.Reference) => void
) {
  const ancestors = getAncestorRefs(activeRef);

  let crumbs: JSX.Element[] = [];
  ancestors.forEach((ref, i) => {
    const reactKey = ref.toString();
    if (i !== 0) {
      crumbs.push(<Icon icon="chevron_right" key={`${reactKey}-chevron`} />);
    }
    crumbs.push(
      <Typography
        key={reactKey}
        className="NodeParent__key"
        use="body1"
        aria-label="Key name"
        onClick={() => navigateToRef(ref)}
      >
        {ref.key || getDbRootUrl(ref)}
      </Typography>
    );
  }, []);
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
