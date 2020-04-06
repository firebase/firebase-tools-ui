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

import {
  RenderOptions,
  RenderResult,
  act,
  render,
} from '@testing-library/react';

export function delay(timeoutMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

// Render a component and wait for some async DOM changes on init.
// This can be used to silence warnings of changing the DOM outside
// act(...), e.g. for RMWC <Tab>s or <Dialog>s.
export async function renderAndWait(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
): Promise<RenderResult> {
  let renderResult: RenderResult;
  await act(async () => {
    renderResult = render(ui, options);
    // Silence warnings caused by async DOM updates.
    await delay(100);
  });
  return renderResult!;
}
