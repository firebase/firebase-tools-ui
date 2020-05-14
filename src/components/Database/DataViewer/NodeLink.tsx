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
import * as React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import { getDbRootUrl } from './common/view_model';

export interface Props {
  dbRef: firebase.database.Reference;
}

export const NodeLink = React.memo<Props>(function NodeLink$({ dbRef }) {
  const key = dbRef.parent === null ? getDbRootUrl(dbRef) : dbRef.key;
  const path = new URL(dbRef.toString()).pathname;
  const match = useRouteMatch();
  const [baseRoute] = match.url.slice(1).split('/data');
  // console.log(match.url, match.url.slice(1).split('/data'), baseRoute);
  const baseUrl = baseRoute + '/data';

  const href = `/${baseUrl}${path}`;
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
