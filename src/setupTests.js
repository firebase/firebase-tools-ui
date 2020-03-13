require('jest-fetch-mock').enableMocks();

// <AppBar> calls window.scrollTo which jsdom does not implement. Let's mock it
// out to silence warnings -- we don't actually need to test it.
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
