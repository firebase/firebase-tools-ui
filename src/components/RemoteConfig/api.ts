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
  return `http://${config.hostAndPort}/v1/projects/${projectId}/remoteConfig`;
}

export function useTemplate(): {
  template: RemoteConfigTemplate;
  fetchNewTemplate: () => void;
} {
  const url = useRemoteConfigAdminUrl();
  const { data: template, mutate: fetchNewTemplate } = useRequest(
    url,
    {},
    // disable auto refresh
    { refreshInterval: 0 }
  );
  return { template: template as RemoteConfigTemplate, fetchNewTemplate };
}

export function useTemplateUpdater() {
  const url = useRemoteConfigAdminUrl();

  return async function updateTemplate(newTemplate: Object) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTemplate),
    });
    return response.ok;
  };
}
