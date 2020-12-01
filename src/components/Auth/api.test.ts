import AuthApi from './api';
import { createFakeUser } from './test_utils';

describe('API', () => {
  const hostAndPort = 'foo.example.com:9002';
  const projectId = 'pelmen-the-project';

  function setup({
    mockFetchResult,
    secondFetchResult,
  }: {
    mockFetchResult: unknown;
    secondFetchResult?: unknown;
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
    return new AuthApi(hostAndPort, projectId);
  }

  it('nukes users', async () => {
    const api = setup({ mockFetchResult: [] });
    const result = await api.nukeUsers();
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/emulator/v1/projects/pelmen-the-project/accounts',
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
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:query',
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
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts',
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

  it('deleteUser', async () => {
    const user = createFakeUser({ localId: 'pelmeni-the-id' });
    const mockFetchResult = { users: [{ localId: 'pirojok' }] };
    const api = setup({ mockFetchResult });
    const result = await api.deleteUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:delete',
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
    const result = await api.updateUser(user);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:update',
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
      ...mockFetchResult,
      password: '',
      providerUserInfo: [],
    });
  });

  it('updateConfig', async () => {
    const allowDuplicateEmails = false;
    const mockFetchResult = { signIn: { allowDuplicateEmails } };
    const api = setup({ mockFetchResult });
    const result = await api.updateConfig(allowDuplicateEmails);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/emulator/v1/projects/pelmen-the-project/config',
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
      'http://foo.example.com:9002/emulator/v1/projects/pelmen-the-project/config'
    );

    expect(result).toEqual(result);
  });
});
