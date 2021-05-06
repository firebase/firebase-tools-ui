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
  function setup() {
    const items = ['pirojok', 'pelmeni', 'kompot', 'chiken', 'borscht'];

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
      items,
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
      const { result, toggleSingle, items } = setup();

      toggleSingle(items[0]);

      expect(result.current.selected).toEqual(new Set([items[0]]));
    });

    it('allows to deselect single element', async () => {
      const { result, toggleSingle, items } = setup();

      toggleSingle(items[0]);
      toggleSingle(items[0]);

      expect(result.current.selected).toEqual(new Set([]));
    });

    it('allows to reselect single element', async () => {
      const { result, toggleSingle, items } = setup();

      toggleSingle(items[0]);
      toggleSingle(items[1]);
      toggleSingle(items[2]);
      toggleSingle(items[1]);

      expect(result.current.selected).toEqual(new Set([items[0], items[2]]));
    });
  });

  describe('selecting with shift', () => {
    it('allows to select multiple elements', async () => {
      const { result, toggleSingle, toggleContinuous, items } = setup();

      toggleSingle(items[0]);
      toggleContinuous(items[2]);

      expect(result.current.selected).toEqual(
        new Set([items[0], items[1], items[2]])
      );
    });

    it('allows to deselect multiple elements', async () => {
      const { result, toggleSingle, toggleContinuous, items } = setup();

      toggleSingle(items[0]);
      toggleSingle(items[1]);
      toggleSingle(items[2]);
      toggleContinuous(items[0]);

      expect(result.current.selected).toEqual(new Set([]));
    });

    it('allows multiple selections and reselections', async () => {
      const { result, toggleSingle, toggleContinuous, items } = setup();

      toggleSingle(items[0]);
      toggleContinuous(items[4]);

      expect(result.current.selected).toEqual(new Set(items));

      toggleContinuous(items[1]);

      expect(result.current.selected).toEqual(new Set([items[0]]));

      toggleContinuous(items[3]);

      expect(result.current.selected).toEqual(
        new Set([items[0], items[1], items[2], items[3]])
      );
    });

    it('allows for selections in different directions', async () => {
      const { result, toggleSingle, toggleContinuous, items } = setup();

      toggleSingle(items[2]);
      toggleContinuous(items[4]);

      expect(result.current.selected).toEqual(
        new Set([items[2], items[3], items[4]])
      );

      toggleContinuous(items[0]);

      expect(result.current.selected).toEqual(new Set(items));
    });

    it('when handling gap selections, sets the value to the latest checked item', async () => {
      const { result, toggleSingle, toggleContinuous, items } = setup();

      toggleSingle(items[0]);
      toggleSingle(items[2]);
      toggleSingle(items[4]);
      toggleContinuous(items[2]);

      expect(result.current.selected).toEqual(new Set([items[0]]));
    });
  });

  describe('toggleAll', () => {
    it('when nothing selected, selects everything', async () => {
      const { result, toggleAll, items } = setup();

      toggleAll();

      expect(result.current.selected).toEqual(new Set(items));
    });

    it('when some thing selected, selects everything', async () => {
      const { result, toggleAll, toggleSingle, items } = setup();

      toggleSingle(items[0]);
      toggleAll();

      expect(result.current.selected).toEqual(new Set(items));
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
      const { result, toggleSingle, clearAll, items } = setup();

      toggleSingle(items[0]);
      clearAll();

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
      const { result, toggleSingle, items } = setup();

      toggleSingle(items[0]);
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
