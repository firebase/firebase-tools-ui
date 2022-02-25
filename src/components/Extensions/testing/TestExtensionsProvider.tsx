import { MemoryRouter } from 'react-router-dom';

import { Config } from '../../../store/config/types';
import { TestEmulatorConfigProvider } from '../../common/EmulatorConfigProvider';
import { ExtensionBackend, ExtensionsProvider } from '../api/useExtensions';

export const TestExtensionsProvider: React.FC<{
  instanceId?: string;
  extensions?: ExtensionBackend[];
}> = ({ children, instanceId, extensions = [] }) => {
  const pagePath = `/extensions${instanceId ? `/${instanceId}` : ''}`;
  const emulatorConfig: Config = {
    projectId: 'example',
    extensions: {
      hostAndPort: 'google.com:1234',
      host: 'google.com',
      port: 1234,
    },
  };

  return (
    <MemoryRouter initialEntries={[pagePath]}>
      <TestEmulatorConfigProvider config={emulatorConfig}>
        <ExtensionsProvider extensionBackends={extensions}>
          {children}
        </ExtensionsProvider>
      </TestEmulatorConfigProvider>
    </MemoryRouter>
  );
};
