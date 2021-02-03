const rootSelector = '#root';

export const indexRoot = async () => await page.$(rootSelector);

export const load = async (path = '') => {
  await page.goto(`${URL}${path}`, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
};

export const getTitle = async () => await page.title();
