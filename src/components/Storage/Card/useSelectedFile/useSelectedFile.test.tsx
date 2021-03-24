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

import { act, renderHook } from '@testing-library/react-hooks';

import { StorageFile } from '../../types';
import { useSelectedFile } from './useSelectedFile';

describe('useSelectedFile', () => {
  const file1 = { fullPath: 'pirojok' } as StorageFile;
  const file2 = { fullPath: 'buter' } as StorageFile;
  const file3 = { fullPath: 'notreal' } as StorageFile;
  const files = [file1, file2];

  it('allows to set a file', async () => {
    const { result } = renderHook(() => useSelectedFile(files));
    expect(result.current[0]).toBeUndefined();
    act(() => {
      result.current[1](file1);
    });
    expect(result.current[0]).toBe(file1);
  });

  it('ignores the file if it is not in the list', async () => {
    const { result } = renderHook(() => useSelectedFile(files));

    act(() => {
      result.current[1](file3);
    });

    expect(result.current[0]).toBeUndefined();
  });
});
