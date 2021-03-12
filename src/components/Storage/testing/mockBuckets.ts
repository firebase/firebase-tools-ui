const fetchMock = require('jest-fetch-mock');
export function mockBuckets(buckets: string[] = []) {
  fetchMock.mockIf(/^http?:\/\/.*\/b$/, () => {
    return Promise.resolve({
      body: JSON.stringify({
        items: buckets.map((name) => ({ name })),
      }),
    });
  });
}
