/**
 * Copyright 2020 Google LLC
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

import { useExtension } from './api/useExtension';
import { RedirectToList } from '.';

export const ExtensionDetails: React.FC = () => {
  const extensionBackend = useExtension();

  // Redirect to list-view if there is no matching instance-id
  if (!extensionBackend) return <RedirectToList />;

  return <div>{extensionBackend.extensionInstanceId}</div>;
};
