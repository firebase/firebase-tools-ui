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

import './RequestActions.scss';

import { Button } from '@rmwc/button';
import { IconButton } from '@rmwc/icon-button';
import React from 'react';

const Action: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <Button
    outlined
    onClick={onClick}
    className="Firestore-Request-Details-Action"
  >
    {label}
  </Button>
);

const RequestActions: React.FC<{}> = () => (
  <>
    <div className="Firestore-Request-Details-Actions-Container">
      <Action label="Retrigger Request" onClick={() => {}} />
    </div>
    <IconButton
      icon={{ icon: 'more_vert' }}
      className="Firestore-Request-Details-Actions-Collapsed-Button"
    />
  </>
);

export default RequestActions;
