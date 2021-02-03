import { screenshotOutlet } from '../page_objects/app';
import { getCards } from '../page_objects/home';
import { load } from '../page_objects/index';

describe('Home', () => {
  it('should redirect to an Emulator on click', async () => {
    await load();
    const cards = await getCards();
    await cards[0].click();
    expect(await screenshotOutlet()).toMatchImageSnapshot();
  });
});
