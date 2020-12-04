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

import './NodeLink.scss';

import { Typography } from '@rmwc/typography';
import firebase from 'firebase';
import * as React from 'react';
import { Link, matchPath, useRouteMatch } from 'react-router-dom';

import { getDbRootUrl } from './common/view_model';

export interface Props {
  dbRef: firebase.database.Reference;
}

export const NodeLink = React.memo<Props>(function NodeLink$({ dbRef }) {
  const key = dbRef.key || getDbRootUrl(dbRef);
  const path = new URL(dbRef.toString()).pathname;
  const href = useHrefWithinSameRoute(path);
  return (
    <Typography
      className="NodeLink"
      use="body1"
      aria-label="Key name"
      tag={Link}
      to={href}
    >
      {key}
    </Typography>
  );
});

/**
 * Creates a href that replaces the `/:path*` part of the current `<Route>`
 *
 * e.g. `/database/sample/data/a/b/c` -> `/database/sample/data/x/y/z`
 */
function useHrefWithinSameRoute(absolutePath: string) {
  const match = useRouteMatch();

  // remove the wildcard :path param, so we can append it manually
  const withoutPath = match.path.replace('/:path*', '');

  const result = matchPath(match.url, { path: withoutPath, strict: true });
  const baseUrl = result?.url || '';
  return baseUrl === '/' ? absolutePath : `${baseUrl}${absolutePath}`;
}
