import { getTitle, load } from '../page_objects/index';

describe('Firebase Emulator Suite', () => {
  it("should be titled 'Firebase Emulator Suite'", async () => {
    await load();
    expect(await getTitle()).toBe('Firebase Emulator Suite');
  });
});
