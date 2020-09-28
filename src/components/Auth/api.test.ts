import AuthApi from './api';
import { AuthUser } from './types';

describe('API', () => {
  const hostAndPort = 'foo.example.com:9002';
  const projectId = 'pelmen-the-project';

  function setup({ mockFetchResult }: { mockFetchResult: unknown }) {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(({
        json: () => mockFetchResult,
      } as unknown) as Response)
    );
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

    expect(result).toEqual([{ ...fakeUserInfo, password }]);
  });

  it('createUser', async () => {
    const user = { phoneNumber: '+1 689-689-6896' };
    const mockFetchResult = { localId: 'pirojok' };
    const api = setup({ mockFetchResult });
    const result = await api.createUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/accounts:signUp',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual(mockFetchResult);
  });

  it('deleteUser', async () => {
    const user = { localid: 'pelmeni-the-id' };
    const mockFetchResult = { localId: 'pirojok' } as AuthUser;
    const api = setup({ mockFetchResult });
    const result = await api.deleteUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/accounts:delete',
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
    const user = { phoneNumber: '+1 689-689-6896' };
    const mockFetchResult = { localId: 'pirojok' };
    const api = setup({ mockFetchResult });
    const result = await api.updateUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://foo.example.com:9002/identitytoolkit.googleapis.com/v1/accounts:update',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual(mockFetchResult);
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
