import { indexRoot } from './index';

const root = async () => (await indexRoot()).$('.App');

export const getCards = async () => (await root()).$$('.Home-EmulatorCard');
