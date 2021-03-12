import * as tokens from '../api/useTokens';

export function mockTokens(result: string[] = []) {
  const createToken = jest.fn();
  const deleteToken = jest.fn();

  jest
    .spyOn(tokens, 'useTokens')
    .mockReturnValue({ tokens: result, createToken, deleteToken });

  return { createToken, deleteToken };
}
