/**
 * Copyright 2022 Google LLC
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

import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import {
  createFakeAuthStateWithTenants,
  createFakeTenant,
} from '../test_utils';
import { Tenant } from '../types';
import TenantPicker from './TenantPicker';

describe('TenantPicker', () => {
  function setup(args: {
    tenants?: Tenant[];
    loading?: boolean;
    tenantId?: string;
  }) {
    const { tenants, loading, tenantId } = args;
    const history = createMemoryHistory({
      initialEntries: [`/auth/${tenantId ?? 'tenantId'}`],
    });
    const authState = createFakeAuthStateWithTenants(tenants ?? []);
    authState.tenants.loading = loading ?? false;
    const store = configureStore<Pick<AppState, 'auth'>>()({
      auth: authState,
    });

    return {
      ...render(
        <Router history={history}>
          <Route path={'/auth/:tenantId*'}>
            <Provider store={store}>
              <TenantPicker />
            </Provider>
          </Route>
        </Router>
      ),
    };
  }

  it('hides the tenant picker when no tenants exist', () => {
    const { queryByLabelText, container } = setup({});

    expect(container).toEqual(document.createElement('div'));
    expect(queryByLabelText('Tenant picker loading')).toBeNull();
    expect(queryByLabelText('Select tenant')).toBeNull();
  });

  it('shows the loading state', () => {
    const { queryByLabelText } = setup({
      tenants: [createFakeTenant({ tenantId: 'notMatchingTenantId' })],
      loading: true,
    });

    expect(queryByLabelText('Select tenant')).toBeNull();
    expect(queryByLabelText('Tenant picker loading')).not.toBeNull();
  });

  it('shows the tenant picker', () => {
    const { queryByLabelText, getByText, getAllByText } = setup({
      tenants: [createFakeTenant({ tenantId: 'tenantId' })],
    });

    expect(queryByLabelText('Select tenant')).not.toBeNull();
    expect(getByText('Default tenant')).not.toBeNull();
    // An extra Aria accessible element gets created for the option selected,
    // so need to use getAllByText
    expect(getAllByText('tenantId').length).toBeGreaterThan(0);
    expect(queryByLabelText('Tenant picker loading')).toBeNull();
  });
});
