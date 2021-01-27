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

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import RequestActions, {
  Action,
  ActionsCollapsedMenu,
  REQUEST_ACTIONS,
  RequestAction,
} from './Actions';

describe('RequestDetails Actions', () => {
  describe('ActionsCollapsedMenu', () => {
    async function getMenuItemByText(text: string) {
      const retriggerRequest = jest.fn();
      const TEST_REQUEST_ACTIONS: RequestAction[] = [
        {
          label: 'Retrigger request',
          action: retriggerRequest,
        },
      ];

      const result = render(
        <ActionsCollapsedMenu requestActions={TEST_REQUEST_ACTIONS} />
      );

      const menu = result.getByLabelText('Open Requests Actions Menu');

      await act(async () => {
        fireEvent.click(menu);
      });

      // NOTE: findByRole is the asynchronous version of getByRole, but
      // expecting element to not appear immediately (it waits for DOM to change).
      // Therefore, this is the equivalent to waiting for menu to open.
      const button = await result.findByRole('menuitem', {
        name: text,
      });

      return { ...result, button, retriggerRequest };
    }

    it('retrigger request', async () => {
      const { button, retriggerRequest } = await getMenuItemByText(
        'Retrigger request'
      );

      await act(async () => {
        fireEvent.click(button);
      });

      expect(retriggerRequest).toHaveBeenCalled();
    });
  });

  describe('Action', () => {
    const ACTION_LABEL = 'Test label';

    it('sets action label correctly', () => {
      const { getByText } = render(
        <Action label={ACTION_LABEL} action={jest.fn()} />
      );
      expect(getByText(ACTION_LABEL)).not.toBeNull();
    });

    it('sets action function correctly', async () => {
      const actionFunction = jest.fn();
      const { getByText } = render(
        <Action label={ACTION_LABEL} action={actionFunction} />
      );
      await act(async () => {
        await fireEvent.click(getByText(ACTION_LABEL));
      });
      expect(actionFunction).toHaveBeenCalled();
    });
  });

  describe('RequestActions', () => {
    it('renders all existing action buttons', () => {
      const { getAllByTestId } = render(<RequestActions />);
      expect(getAllByTestId('request-details-action-button').length).toEqual(
        REQUEST_ACTIONS.length
      );
    });

    it('renders the actions collapsed-menu button', () => {
      const { getByTestId } = render(<RequestActions />);
      expect(
        getByTestId('request-details-header-actions-collapsed-menu')
      ).not.toBeNull();
    });
  });
});
