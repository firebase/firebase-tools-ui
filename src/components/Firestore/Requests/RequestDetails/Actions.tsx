/**
 * Copyright 2021 Google LLC
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

import './Actions.scss';

import { Button } from '@rmwc/button';
import React from 'react';

import RequestActionsCollapsedMenu from './ActionsCollapsedMenu';

export interface RequestAction {
  label: string;
  action: () => void;
}
export const REQUEST_ACTIONS: RequestAction[] = [
  {
    label: 'Retrigger request',
    action: () => {},
  },
];

export const Action: React.FC<RequestAction> = ({ label, action }) => (
  <Button
    outlined
    onClick={action}
    className="Firestore-Request-Details-Action"
    role="request-details-action-button"
  >
    {label}
  </Button>
);

const RequestActions: React.FC = () => (
  <div data-testid="request-details-header-actions">
    <div className="Firestore-Request-Details-Actions-Container">
      {REQUEST_ACTIONS.map(({ label, action }) => (
        <Action key={label} label={label} action={action} />
      ))}
    </div>
    <RequestActionsCollapsedMenu requestActions={REQUEST_ACTIONS} />
  </div>
);

export default RequestActions;
