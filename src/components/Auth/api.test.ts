import AuthApi from './api';
import { AuthUser } from './types';

describe('API', () => {
  const hostAndPort = 'piroj.ok';
  const projectId = 'pelmen-the-project';

  function setup(result: unknown) {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(({
        json: () => result,
      } as unknown) as Response)
    );
    return new AuthApi(hostAndPort, projectId);
  }

  it('nukes users', async () => {
    const api = setup([]);
    const result = await api.nukeUsers();
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/emulator/v1/projects/pelmen-the-project/accounts',
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
      userInfo: [fakeUserInfo],
    });
    const result = await api.fetchUsers();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/identitytoolkit.googleapis.com/v1/projects/pelmen-the-project/accounts:query',
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
    const user = { phoneNumber: '123456' };
    const response = { localId: 'pirojok' };
    const api = setup(response);
    const result = await api.createUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/identitytoolkit.googleapis.com/v1/accounts:signUp',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual(response);
  });

  it('deleteUser', async () => {
    const user = { localid: 'pelmeni-the-id' };
    const response = { localId: 'pirojok' } as AuthUser;
    const api = setup(response);
    const result = await api.deleteUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/identitytoolkit.googleapis.com/v1/accounts:delete',
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
    const user = { phoneNumber: '123456' };
    const response = { localId: 'pirojok' };
    const api = setup(response);
    const result = await api.updateUser(user);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/identitytoolkit.googleapis.com/v1/accounts:update',
      {
        body: JSON.stringify(user),
        headers: {
          Authorization: 'Bearer owner',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    expect(result).toEqual(response);
  });

  it('updateConfig', async () => {
    const allowDuplicateEmails = false;
    const response = { signIn: { allowDuplicateEmails } };
    const api = setup(response);
    const result = await api.updateConfig(allowDuplicateEmails);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/emulator/v1/projects/pelmen-the-project/config',
      {
        body: JSON.stringify(response),
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
    const response = { signIn: { allowDuplicateEmails: false } };
    const api = setup(response);
    const result = await api.getConfig();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://piroj.ok/emulator/v1/projects/pelmen-the-project/config'
    );

    expect(result).toEqual(result);
  });
});
