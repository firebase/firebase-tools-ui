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

import './BreadCrumbs.scss';

import { IconButton } from '@rmwc/icon-button';
import classnames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

export interface Props {
  /** The base url to prepend when creating Router links */
  base: string;
  path: string;
  onEdit?: () => void;
}

const EMPTY_KEYS: string[] = [];

export const BreadCrumbs: React.FC<Props> = ({
  base,
  path,
  onEdit,
  children,
}) => {
  const normalizedPath = path.startsWith('/') ? path.substr(1) : path;
  const keys = normalizedPath ? normalizedPath.split('/') : EMPTY_KEYS;

  const hrefs = keys.reduce<string[]>((acc, key) => {
    const prevLink = acc.length ? acc[acc.length - 1] : base;
    acc.push(`${prevLink}/${key}`);
    return acc;
  }, []);

  return (
    <ul role="navigation" className="BreadCrumbs">
      <li className="BreadCrumbs-crumb">
        <IconButton icon="home" tag={Link} to={base} />
      </li>

      {keys.map((key, i) => (
        <li
          key={hrefs[i]}
          className={classnames('BreadCrumbs-crumb', 'BreadCrumbs-link', {
            'BreadCrumbs-active': i === keys.length - 1,
          })}
        >
          <Link to={hrefs[i]}>{decodeURIComponent(key)}</Link>
        </li>
      ))}

      <li
        className="BreadCrumbs-edit"
        aria-label="Edit URL"
        onClick={() => onEdit && onEdit()}
      >
        <IconButton icon="edit" />
      </li>
      <li>{children}</li>
    </ul>
  );
};
