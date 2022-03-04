/**
 * Copyright 2022 Google LLC
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

import { createContext, useContext } from 'react';

import { ExtensionsContext } from './useExtensions';

const InstanceIdContext = createContext('');

export const InstanceIdProvider: React.FC<{ instanceId: string }> = ({
  children,
  instanceId,
}) => {
  return (
    <InstanceIdContext.Provider value={instanceId}>
      {children}
    </InstanceIdContext.Provider>
  );
};

export function useExtension() {
  const extensions = useContext(ExtensionsContext);
  const instanceId = useContext(InstanceIdContext);
  return extensions.find((e) => e.id === instanceId);
}
