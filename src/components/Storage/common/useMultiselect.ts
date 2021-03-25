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

import { useState } from 'react';

function useSelected<T>(options: T[]): [Set<T>, (t: Set<T>) => void] {
  const [selectedValue, setSelected] = useState(new Set<T>());

  return [
    new Set(options.filter((path) => selectedValue.has(path))),
    setSelected,
  ];
}

// Takes a list of elements and allow to select multiple like in gmail.
export function useMultiselect<T>(options: T[]) {
  const [selected, setSelected] = useSelected(options);

  /**
   * Multiple selection is actually pretty tricky.
   *
   * Storing just single "last selected" value is not enough.
   *
   * e.g. user has a pretty complex selection, then selects and deselect
   * another checkbox. We need stack to know where to get back to have a
   * reference point.
   */
  const [stack, setStack] = useState<T[]>([]);

  function findBetween(item1: T, item2: T) {
    const index1 = options.indexOf(item1);
    const index2 = options.indexOf(item2);

    const numberOfItems = Math.abs(index1 - index2) + 1;
    const firstIndex = index1 < index2 ? index1 : index2;
    return options.slice(firstIndex, firstIndex + numberOfItems);
  }

  // We when deselecting the item, we want to remove it from the stack even if
  // it's in the middle.
  function removeFromStack(item: T) {
    setStack(stack.filter((i) => i !== item));
  }

  function toggleAllItems(items: T[], shouldSelect: boolean) {
    for (const item of items) {
      if (shouldSelect) {
        selected.add(item);
      } else {
        selected.delete(item);
        removeFromStack(item);
      }
    }

    setSelected(new Set([...selected]));
  }

  function addToStack(item: T) {
    setStack([...stack, item]);
  }

  return {
    allSelected: selected.size === options.length && selected.size > 0,
    allIndeterminate: selected.size > 0 && selected.size < options.length,
    isSelected(item: T) {
      return selected.has(item);
    },
    selected,
    toggleSingle(item: T) {
      if (selected.has(item)) {
        toggleAllItems([item], false);
        removeFromStack(item);
      } else {
        toggleAllItems([item], true);
        addToStack(item);
      }
    },
    toggleContinuous(item: T) {
      if (selected.size === 0 || stack.length === 0) {
        this.toggleSingle(item);
      }

      const between = findBetween(stack[stack.length - 1], item);

      toggleAllItems(between, !this.isSelected(item));
      addToStack(item);
    },
    clearAll() {
      setSelected(new Set());
      setStack([]);
    },
    toggleAll() {
      if (selected.size === options.length) {
        setSelected(new Set());
      } else {
        toggleAllItems(options, true);
      }
    },
  };
}

export type UseMultiselectResult = ReturnType<typeof useMultiselect>;
