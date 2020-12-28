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

import './ActionsCollapsedMenu.scss';

import { IconButton } from '@rmwc/icon-button';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import React from 'react';

interface Props {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  onRetriggerRequest: () => void;
}

const RequestActionsCollapsedMenu: React.FC<Props> = ({
  menuOpen,
  setMenuOpen,
  onRetriggerRequest,
}) => (
  <div className="Firestore-Request-Details-Actions-Collapsed-Menu">
    <SimpleMenu
      open={menuOpen}
      onOpen={() => setMenuOpen(true)}
      onClose={() => setMenuOpen(false)}
      handle={
        <IconButton
          icon={{ icon: 'more_vert' }}
          label="Open Requests Actions Menu"
          className="Firestore-Request-Details-Actions-Collapsed-Button"
        />
      }
      renderToPortal
    >
      <MenuItem
        onClick={() => {
          setMenuOpen(false);
          onRetriggerRequest();
        }}
      >
        Retrigger request
      </MenuItem>
    </SimpleMenu>
  </div>
);

export default RequestActionsCollapsedMenu;
