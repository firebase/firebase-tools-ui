import { screenshotOutlet } from '../page_objects/app';
import { load } from '../page_objects/index';

describe('App', () => {
  it('should look good', async () => {
    await load();
    expect(await screenshotOutlet()).toMatchImageSnapshot();
  });
});
