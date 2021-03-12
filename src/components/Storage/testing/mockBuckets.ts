export function mockBuckets(buckets: string[] = []) {
  const actualFetch = global.fetch;
  jest
    .spyOn(global, 'fetch')
    .mockImplementation((input: RequestInfo, init?: RequestInit) => {
      if (/^http?:\/\/.*\/b$/.test(input.toString())) {
        return Promise.resolve(({
          json: () => {
            return {
              items: buckets.map((name) => ({ name })),
            };
          },
        } as unknown) as Response);
      }

      return actualFetch(input, init);
    });
}
