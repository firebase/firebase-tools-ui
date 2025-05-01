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

import AuthApi from './api';
import { createFakeUser } from './test_utils';

describe('API', () => {
  const hostAndPort = 'foo.example.com:9002';
  const projectId = 'pelmen-the-project';
  const testTenantId = 'test-tenant-id';

  function setup({
    mockFetchResult,
    secondFetchResult,
    tenantId,
  }: {
    mockFetchResult: unknown;
    secondFetchResult?: unknown;
    tenantId?: string;
  }) {
    const fetchSpy = jest.spyOn(global, 'fetch').mockReturnValueOnce(
      Promise.resolve({
        json: () => mockFetchResult,
      } as Response)
    );
    if (secondFetchResult) {
      fetchSpy.mockReturnValueOnce(
        Promise.resolve({
          json: () => secondFetchResult,
        } as Response)
      );
    }
    return new AuthApi(hostAndPort, projectId, tenantId);
  }

  it('nukes users', async () => {
    const api = setup({ mockFetchResult: [] });
    const result = await api.nukeUsers();
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/emulator/v1/projects/pelmen-the-project/accounts',
      {
        headers: { Authorization: 'Bearer owner' },
        method: 'DELETE',
      }
    );
  });

  it('fetch users', async () => {
    const password = 'p1r0j0k';
    const fakeUserInfo = {
      passwordHash: 'fakeHash:salt=asdfgh3:password=' + password,
    };
    const api = setup({
      mockFetchResult: {
        userInfo: [fakeUserInfo],
      },
    });
    const result = await api.fetchUsers();

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:query',
      {
        body: '{}',
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual([
      {
        ...fakeUserInfo,
        password,
        providerUserInfo: [],
      },
    ]);
  });

  it('fetchUsers for tenant project', async () => {
    const password = 'p1r0j0k';
    const fakeUserInfo = {
      passwordHash: 'fakeHash:salt=asdfgh3:password=' + password,
    };
    const api = setup({
      mockFetchResult: {
        userInfo: [fakeUserInfo],
      },
      tenantId: testTenantId,
    });

    const result = await api.fetchUsers();

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:query',
      {
        body: JSON.stringify({ tenantId: testTenantId }),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );
    expect(result).toEqual([
      {
        ...fakeUserInfo,
        password,
        providerUserInfo: [],
      },
    ]);
  });

  it('fetchTenants', async () => {
    const tenants = [{ tenantId: 'tenant-id-1' }, { tenantId: 'tenant-id-2' }];
    const api = setup({
      mockFetchResult: {
        tenants,
      },
    });

    const result = await api.fetchTenants();

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v2/projects/pelmen-the-project/tenants',
      {
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );
    expect(result).toEqual(tenants);
  });

  it('fetchUser', async () => {
    const localId = 'local-id';
    const api = setup({
      mockFetchResult: {
        users: [{ localId }],
      },
    });

    const result = await api.fetchUser(localId);

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:lookup',
      {
        body: JSON.stringify({ localId: [localId] }),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );
    expect(result.localId).toEqual(localId);
  });

  it('fetchUser for tenant project', async () => {
    const localId = 'local-id';
    const api = setup({
      mockFetchResult: {
        users: [{ localId }],
      },
      tenantId: testTenantId,
    });

    const result = await api.fetchUser(localId);

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:lookup',
      {
        body: JSON.stringify({ localId: [localId], tenantId: testTenantId }),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );
    expect(result.localId).toEqual(localId);
  });

  it('createUser', async () => {
    const user = { phoneNumber: '+1 555-555-0100' };
    const mockFetchResult = { localId: 'pirojok' };
    const serverUser = { localId: 'pirojok' };
    const api = setup({
      mockFetchResult,
      secondFetchResult: { users: [serverUser] },
    });
    const result = await api.createUser(user);

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual({
      ...serverUser,
      password: '',
      providerUserInfo: [],
    });
  });

  it('createUser in tenant project', async () => {
    const user = { phoneNumber: '+1 555-555-0100' };
    const mockFetchResult = { localId: 'pirojok' };
    const serverUser = { localId: 'pirojok' };
    const api = setup({
      mockFetchResult,
      secondFetchResult: { users: [serverUser] },
      tenantId: testTenantId,
    });
    const result = await api.createUser(user);

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts',
      {
        body: JSON.stringify({ ...user, tenantId: testTenantId }),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual({
      ...serverUser,
      password: '',
      providerUserInfo: [],
    });
  });

  it('deleteUser', async () => {
    const user = createFakeUser({ localId: 'pelmeni-the-id' });
    const mockFetchResult = { users: [{ localId: 'pirojok' }] };
    const api = setup({ mockFetchResult });
    const result = await api.deleteUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:delete',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual(undefined);
  });

  it('updateUser', async () => {
    const user = { phoneNumber: '+1 555-555-0100' };
    const mockFetchResult = { localId: 'pirojok' };

    const api = setup({
      mockFetchResult,
      secondFetchResult: { users: [mockFetchResult] },
    });
    const result = await api.updateUser({ ...user, ...mockFetchResult });

    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:update',
      {
        body: JSON.stringify({ ...user, ...mockFetchResult }),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual({
      ...mockFetchResult,
      password: '',
      providerUserInfo: [],
    });
  });

  it('updateConfig', async () => {
    const allowDuplicateEmails = false;
    const mockFetchResult = { signIn: { allowDuplicateEmails } };
    const api = setup({ mockFetchResult });
    const result = await api.updateConfig({ signIn: { allowDuplicateEmails } });
    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/emulator/v1/projects/pelmen-the-project/config',
      {
        body: JSON.stringify(mockFetchResult),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      }
    );

    expect(result).toEqual(result);
  });

  it('getConfig', async () => {
    const mockFetchResult = { signIn: { allowDuplicateEmails: false } };
    const api = setup({ mockFetchResult });
    const result = await api.getConfig();
    expect(global.fetch).toHaveBeenCalledWith(
      '//foo.example.com:9002/emulator/v1/projects/pelmen-the-project/config',
      {},
    );

    expect(result).toEqual(result);
  });
});
