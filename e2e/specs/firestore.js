import { screenshotOutlet } from '../page_objects/app';
import { load } from '../page_objects/firestore';

describe('Firestore', () => {
  it('should look good on load', async () => {
    await load();
    expect(await screenshotOutlet()).toMatchImageSnapshot();
  });
});
