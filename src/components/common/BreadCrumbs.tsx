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

import { ok } from 'assert';

import { IconButton } from '@rmwc/icon-button';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  /** The base url to prepend when creating Router links */
  base: string;
  reference?:
    | firebase.firestore.CollectionReference
    | firebase.firestore.DocumentReference;
  rtdbRef?: firebase.database.Reference;
}

export const BreadCrumbs: React.FC<Props> = ({ base, rtdbRef, reference }) => {
  ok(
    rtdbRef || reference,
    'BreadCrumbs: rtdbRef or reference must be supplied'
  );

  const path = rtdbRef ? new URL(rtdbRef.toString()).pathname : reference!.path;

  const keys = path.split('/');

  const hrefs = keys.reduce<string[]>((acc, key) => {
    const prevLink = acc.length ? acc[acc.length - 1] : base;
    acc.push(`${prevLink}/${key}`);
    return acc;
  }, []);

  return (
    <ul role="navigation" className="BreadCrumbs">
      <li className="BreadCrumbs-crumb">
        <IconButton icon="home" tag={props => <Link to={base} {...props} />} />
      </li>

      {keys.map((key, i) => (
        <li className="BreadCrumbs-crumb">
          <Link to={hrefs[i]}>{key}</Link>
        </li>
      ))}
    </ul>
  );
};
