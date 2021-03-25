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

import { useMultiselect } from './useMultiselect';

describe('useMultiSelect', () => {
  const item1 = 'a';
  const item2 = 'b';

  function setup() {
    const items = [item1, item2, 'c', 'd', 'e'];

    const { result } = renderHook(() => useMultiselect(items));

    function toggleSingle(item: string) {
      act(() => {
        result.current.toggleSingle(item);
      });
    }

    function toggleContinuous(item: string) {
      act(() => {
        result.current.toggleContinuous(item);
      });
    }

    function toggleAll() {
      act(() => {
        result.current.toggleAll();
      });
    }

    function clearAll() {
      act(() => {
        result.current.clearAll();
      });
    }

    return {
      result,
      toggleSingle,
      toggleContinuous,
      toggleAll,
      clearAll,
    };
  }

  describe('single selections', () => {
    it('has empty selection initially', async () => {
      const r = setup();
      expect(r.result.current.selected).toEqual(new Set());
    });

    it('allows to select single element', async () => {
      const { result, toggleSingle } = setup();

      toggleSingle(item1);

      expect(result.current.selected).toEqual(new Set([item1]));
    });

    it('allows to deselect single element', async () => {
      const { result, toggleSingle } = setup();

      toggleSingle(item1);
      toggleSingle(item1);

      expect(result.current.selected).toEqual(new Set([]));
    });

    it('allows to reselect single element', async () => {
      const { result, toggleSingle } = setup();

      toggleSingle(item1);
      toggleSingle(item2);
      toggleSingle('c');
      toggleSingle(item2);

      expect(result.current.selected).toEqual(new Set([item1, 'c']));
    });
  });

  describe('selecting with shift', () => {
    it('allows to select multiple elements', async () => {
      const { result, toggleSingle, toggleContinuous } = setup();

      toggleSingle(item1);
      toggleContinuous('c');

      expect(result.current.selected).toEqual(new Set([item1, item2, 'c']));
    });

    it('allows to deselect multiple elements', async () => {
      const { result, toggleSingle, toggleContinuous } = setup();

      toggleSingle(item1);
      toggleSingle(item2);
      toggleSingle('c');
      toggleContinuous(item1);

      expect(result.current.selected).toEqual(new Set([]));
    });

    it('allows multiple selections and reselections', async () => {
      const { result, toggleSingle, toggleContinuous } = setup();

      toggleSingle(item1);
      toggleContinuous('e');

      expect(result.current.selected).toEqual(
        new Set([item1, item2, 'c', 'd', 'e'])
      );

      toggleContinuous(item2);

      expect(result.current.selected).toEqual(new Set([item1]));

      toggleContinuous('d');

      expect(result.current.selected).toEqual(
        new Set([item1, item2, 'c', 'd'])
      );
    });

    it('allows for selections in different directions', async () => {
      const { result, toggleSingle, toggleContinuous } = setup();

      toggleSingle('c');
      toggleContinuous('e');

      expect(result.current.selected).toEqual(new Set(['c', 'd', 'e']));

      toggleContinuous(item1);

      expect(result.current.selected).toEqual(
        new Set([item1, item2, 'c', 'd', 'e'])
      );
    });

    it('when handling gap selections, sets the value to the latest checked item', async () => {
      const { result, toggleSingle, toggleContinuous } = setup();

      toggleSingle(item1);
      toggleSingle('c');
      toggleSingle('e');
      toggleContinuous('c');

      expect(result.current.selected).toEqual(new Set([item1]));
    });
  });

  describe('toggleAll', () => {
    it('when nothing selected, selects everything', async () => {
      const { result, toggleAll } = setup();

      toggleAll();

      expect(result.current.selected).toEqual(
        new Set([item1, item2, 'c', 'd', 'e'])
      );
    });

    it('when some thing selected, selects everything', async () => {
      const { result, toggleAll, toggleSingle } = setup();

      toggleSingle(item1);
      toggleAll();

      expect(result.current.selected).toEqual(
        new Set([item1, item2, 'c', 'd', 'e'])
      );
    });

    it('when everything selected, selects everything', async () => {
      const { result, toggleAll } = setup();

      toggleAll();
      toggleAll();

      expect(result.current.selected).toEqual(new Set([]));
    });
  });

  describe('clearAll', () => {
    it('drops the selection', async () => {
      const { result, toggleSingle } = setup();

      toggleSingle(item1);
      toggleSingle(item1);

      expect(result.current.selected).toEqual(new Set());
    });
  });

  describe('allSelected', () => {
    it('for no selection - allSelected = false, indeterminate = false', async () => {
      const { result } = setup();

      expect(result.current.allSelected).toEqual(false);
      expect(result.current.allIndeterminate).toEqual(false);
    });

    it('for one selected - allSelected = false, indeterminate = true', async () => {
      const { result, toggleSingle } = setup();

      toggleSingle(item1);
      expect(result.current.allSelected).toEqual(false);
      expect(result.current.allIndeterminate).toEqual(true);
    });

    it('for all selected - allSelected = true, indeterminate = false', async () => {
      const { result, toggleAll } = setup();

      toggleAll();
      expect(result.current.allSelected).toEqual(true);
      expect(result.current.allIndeterminate).toEqual(false);
    });
  });
});
