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

import { Config, Emulator, hostAndPort } from '../../store/config';

const emulatorConfigContext = React.createContext<
  | {
      config?: Config | null;
      promise: Promise<Config | null | undefined>;
    }
  | undefined
>(undefined);

const CONFIG_API = '/api/config';

/**
 * Returns a promise that resolves when the data changes.
 *
 * Note: When the argument passed !== previously passed, the previously returned
 * promise is resolved and a new pending promise is returned (resolved on the
 * next change).
 *
 * @example
 *   const data = useMyAwesomeDataThatMayChange();
 *   const promise = useOnChangePromise(data);
 *   if (!someCondition(data)) throw promise; // use with <Suspense>
 */
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
  const { data } = useSwr<Config | null>(CONFIG_API, configFetcher, {
    // Keep refreshing config to detect when emulators are stopped or restarted
    // with a different config (e.g. different emulators or host / ports).
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

export function useEmulatorConfig<E extends Emulator>(
  emulator: E
): NonNullable<Config[E]> {
  const config = useConfig();
  const emulatorConfig = config[emulator];
  const promise = useOnChangePromise(emulatorConfig);
  if (emulatorConfig === undefined) {
    // Emulator Suite is running, but the specified emulator is not running.
    throw promise;
  }
  // Needed to convince TypeScript that emulatorConfig is not undefined.
  return emulatorConfig as NonNullable<Config[E]>;
}

export function useIsEmulatorDisabled(emulator?: Emulator): boolean {
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

async function configFetcher(url: string): Promise<Config> {
  const json = (await jsonFetcher(url)) as any;
  const result: Config = {
    projectId: json.projectId as string,
  };
  for (const [key, value] of Object.entries<any>(json)) {
    if (key === 'projectId') {
      continue;
    }
    const host = fixHostname(value.host as string);
    result[key as Emulator] = {
      ...value,
      host,
      hostAndPort: hostAndPort(host, value.port as number),
    };
  }

  if (result.firestore?.webSocketHost) {
    result.firestore.webSocketHost = fixHostname(
      result.firestore.webSocketHost
    );
  }
  return result;
}

export function makeDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

/**
 * Return a connectable hostname, replacing wildcard 0.0.0.0 or :: with the best
 * effort guess but keep the others unchanged.
 *
 * For emulators listening using wildcard, we assume that they can be connected
 * using the same hostname as the current page (but different ports of course).
 * This works for local setup as well as running the suite (emulators + UI)
 * remotely and connect from another device. It does not work for some setups
 * e.g. when Emulator UI is proxied but not the individual emulators.
 */
function fixHostname(host: string): string {
  // We should never return 0.0.0.0 or :: since they won't work in some OSes:
  // https://github.com/firebase/firebase-tools-ui/issues/286
  if (host === '0.0.0.0') {
    host = window.location.hostname;
    // Replace localhost with IPv4 loopback since some browsers / OSes may
    // resolve it to IPv6 and connection may fail. Ditto for IPv6 cases below.
    if (!host || host === 'localhost') {
      host = '127.0.0.1';
    }
  } else if (host === '::') {
    host = window.location.hostname;
    if (!host || host === 'localhost') {
      host = '::1';
    }
  }
  return host;
}
