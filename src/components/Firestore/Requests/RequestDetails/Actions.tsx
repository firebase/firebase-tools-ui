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
import React, { useState } from 'react';

import RequestActionsCollapsedMenu from './ActionsCollapsedMenu';

interface ActionProps {
  label: string;
  onClick: () => void;
}

const Action: React.FC<ActionProps> = ({ label, onClick }) => (
  <Button
    outlined
    onClick={onClick}
    className="Firestore-Request-Details-Action"
  >
    {label}
  </Button>
);

const RequestActions: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <>
      <div className="Firestore-Request-Details-Actions-Container">
        <Action label="Retrigger request" onClick={() => {}} />
      </div>
      <RequestActionsCollapsedMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onRetriggerRequest={() => {}}
      />
    </>
  );
};

export default RequestActions;
