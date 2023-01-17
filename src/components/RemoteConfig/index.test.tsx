// import React from 'react';
// import { render, waitFor } from '@testing-library/react';
// import RemoteConfigWrapper from './index';
// import { EmulatorConfigProvider, TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';

// export const RemoteConfigTestProvider: React.FC<
//   React.PropsWithChildren<{}>
// > = React.memo(({ children }) => {
//   const projectId = `${process.env.GCLOUD_PROJECT}-${Date.now()}`;
//   const hostAndPort = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
//   if (!projectId || !hostAndPort) {
//     throw new Error('DatabaseTestProviders requires a running Emulator');
//   }
//   const [host, port] = hostAndPort.split(':');

//   return (
//     <EmulatorConfigProvider
//       config={{
//         projectId,
//         database: { host, port: Number(port), hostAndPort },
//       }}
//     >
//       <DatabaseEmulatedApiProvider namespace={namespace}>
//         <Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
//           {children}
//         </Suspense>
//       </DatabaseEmulatedApiProvider>
//     </TestEmulatorConfigProvider>
//   );
// });

// describe('Remote Config Page', () => {
//     it('renders canvas and card', async () => {
//       const { getByText } = render(<TestEmulatorConfigProvider config><RemoteConfigWrapper /></EmulatorConfigProvider>);

//       expect(getByText('Reset')).toBeDefined();
//     });
//   });
