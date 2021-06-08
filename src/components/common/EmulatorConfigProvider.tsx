/**
 * Copyright 2021 Google LLC
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

import React, { useEffect, useState } from 'react';
import useSwr, { mutate } from 'swr';

import { Config, Emulator } from '../../store/config';

const emulatorConfigContext = React.createContext<
  | {
      config?: Config | null;
      promise: Promise<Config | null | undefined>;
    }
  | undefined
>(undefined);

const CONFIG_API = '/api/config';

export function useOnChangePromise<T>(data: T): Promise<T> {
  // Use only one single state to prevent accidental partial updates.
  const [state, setState] = useState(() => ({
    oldData: data,
    deferred: makeDeferred<T>(),
  }));

  useEffect(() => {
    if (data !== state.oldData) {
      const oldDeferred = state.deferred;
      setState({
        oldData: data,
        deferred: makeDeferred<T>(),
      });
      oldDeferred.resolve(data);
    }
  }, [data, state, setState]);
  return state.deferred.promise;
}

export const EmulatorConfigProvider: React.FC<{ refreshInterval: number }> = ({
  refreshInterval,
  children,
}) => {
  // We don't use suspense here since the provider should never be suspended --
  // it merely creates a context for hooks (e.g. useConfig) who do suspend.
  const { data } = useSwr<Config | null>(CONFIG_API, jsonFetcher, {
    refreshInterval,

    // Emulator UI works fully offline. Even if the browser cannot reach LAN or
    // any router, this page and the CONFIG_API will still work if they are on
    // the same physical device (e.g. localhost/127.0.0.1/containers/VMs). See:
    // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
    refreshWhenOffline: true,
    onErrorRetry(_, __, ___, revalidate, { retryCount }) {
      if (retryCount < 2) {
        // If the Emulator Hub is running locally, we are very unlikely to get
        // any errors at all. However, an occasional blip may happen when using
        // Emulator UI remotely (or through port forwarding). Let's retry once.
        // Note that swr will keep `data` while retrying, so UI won't unload.
        // (This overwrites swr's built-in exponential backoff timeouts.)
        setTimeout(() => revalidate({ retryCount }), refreshInterval);
      } else {
        // We cannot reach the discovery API for 2+ times. This usually means
        // Emulator Hub is stopped or unreachable. swr won't clear data on error
        // so we manually set data to null to represent this situation.
        // Tell swr to revalidate (retry the fetch). No need for setTimeout.
        mutate(CONFIG_API, null, /* shouldRevalidate= */ true);
      }
    },
  });

  const promise = useOnChangePromise(data);

  return (
    <emulatorConfigContext.Provider
      value={{
        config: data,
        promise,
      }}
    >
      {children}
    </emulatorConfigContext.Provider>
  );
};

export const TestEmulatorConfigProvider: React.FC<{
  config: Config | null | undefined;
}> = ({ config, children }) => {
  const promise = useOnChangePromise(config);
  return (
    <emulatorConfigContext.Provider
      value={{
        config,
        promise,
      }}
    >
      {children}
    </emulatorConfigContext.Provider>
  );
};

export function useConfig(): Config {
  const context = React.useContext(emulatorConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a <EmulatorConfigProvider>');
  }
  if (context.config === undefined) {
    // Loading. Throw the promise to suspend rendering (to support <Suspense>).
    throw context.promise;
  } else if (context.config == null) {
    // Emulator Suite is disconnected / unreachable.
    throw context.promise;
  } else {
    return context.config;
  }
}

export function useEmulatorConfig(
  emulator: Emulator
): NonNullable<Config[typeof emulator]> {
  const config = useConfig();
  const emulatorConfig = config[emulator];
  const promise = useOnChangePromise(emulatorConfig);
  if (emulatorConfig === undefined) {
    // Emulator Suite is running, but the specified emulator is not running.
    throw promise;
  }
  return emulatorConfig;
}

export function useIsEmulatorDisabled(emulator?: keyof Config): boolean {
  const config = useConfigOptional();
  if (config === undefined) {
    // Still loading, we cannot tell if emulator is disabled.
    return false;
  }
  if (config === null) {
    // The whole suite is disconnected, so we show all emulators as disabled.
    return true;
  }
  if (emulator && !config[emulator]) {
    return true;
  }
  return false;
}

/**
 * Try getting Config, but return null if disconnected or undefined if loading.
 * Should be used very sparingly. Prefer useConfig() for most cases.
 */
export function useConfigOptional(): Config | undefined | null {
  const context = React.useContext(emulatorConfigContext);
  if (context === undefined) {
    throw new Error(
      'useConfigOptional must be used within a <EmulatorConfigProvider>'
    );
  }
  return context.config;
}

async function jsonFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Got HTTP status code ${response.status}`);
  }
  return response.json();
}

function makeDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}
