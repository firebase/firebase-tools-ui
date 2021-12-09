import { RemoteConfigTemplate } from 'firebase-admin/lib/remote-config';

/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useConfig, useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { useRequest } from '../common/useRequest';

function useRemoteConfigAdminUrl() {
  const { projectId } = useConfig();
  const config = useEmulatorConfig('remote config');
  return `http://${config.hostAndPort}/v1/projects/${projectId}/remoteConfig?clientType=emulator`;
}

function useRemoteConfigClientUrl() {
  const { projectId } = useConfig();
  const config = useEmulatorConfig('remote config');
  return `http://${config.hostAndPort}/v1/projects/${projectId}/namespaces/firebase:fetch`;
}

export function useTemplate(): {
  template: RemoteConfigTemplate;
  refetchTemplate: () => void;
  updateTemplate: (newTemplate: RemoteConfigTemplate) => void;
} {
  const url = useRemoteConfigAdminUrl();
  const { data: template, mutate, isValidating } = useRequest(
    url,
    { method: 'GET' },
    // disable auto refresh
    { refreshInterval: 0 }
  );

  const refetchTemplate = () => mutate();
  const updateTemplate = async (newTemplate: RemoteConfigTemplate) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTemplate),
    });

    if (!response.ok) {
      console.error(response.status);
    }

    mutate();
  };

  return {
    template: template as RemoteConfigTemplate,
    refetchTemplate,
    updateTemplate,
  };
}
