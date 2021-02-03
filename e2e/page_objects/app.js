import { indexRoot } from './index';

const root = async () => await (await indexRoot()).$('.App');
const outlet = async () => await (await root()).$('.App-main');

export const screenshotOutlet = async () => {
  return (await outlet()).screenshot();
};
