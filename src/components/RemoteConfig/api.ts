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

import type {
  RemoteConfigParameterValue,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';


export function remoteConfigParameterValueToString(
  paramValue: RemoteConfigParameterValue
) {
  if ('value' in paramValue) {
    return paramValue.value;
  } else {
    return 'In-app default';
  }
}

function useRemoteConfigRevertUrl() {
  const config = useEmulatorConfig('remoteconfig');
  return `http://${config.hostAndPort}/revert`;
}

function useRemoteConfigAdminUrl() {
  const { projectId } = useConfig();
  const config = useEmulatorConfig('remoteconfig');
  return `http://${config.hostAndPort}/v1/projects/${projectId}/remoteConfig?clientType=emulator`;
}

function useRemoteConfigClientUrl() {
  const { projectId } = useConfig();
  const config = useEmulatorConfig('remoteconfig');
  return `http://${config.hostAndPort}/v1/projects/${projectId}/namespaces/firebase:fetch`;
}

export function useTemplate(): {
  template: RemoteConfigTemplate;
  refetchTemplate: () => void;
  updateTemplate: (newTemplate: RemoteConfigTemplate) => Promise<void>;
  revertTemplate: () => Promise<void>;
} {
  const url = useRemoteConfigAdminUrl();
  const revertUrl = useRemoteConfigRevertUrl();
  const {
    data: template,
    mutate,
    isValidating,
  } = useRequest(
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

    await mutate();
  };

  const revertTemplate = async () => {
    const response = await fetch(revertUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error(response.status);
    }

    // see if we can just use the response from the put
    await mutate();
  };

  return {
    template: template as RemoteConfigTemplate,
    refetchTemplate,
    updateTemplate,
    revertTemplate,
  };
}
