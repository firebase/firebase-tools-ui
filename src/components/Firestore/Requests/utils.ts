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

import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';

import { RulesOutcome } from './rules_evaluation_result_model';
import { OutcomeData } from './types';

// Matches the material-icon name by request outcome
export const ICON_SELECTOR = {
  allow: 'check_circle',
  deny: 'remove_circle',
  error: 'report_problem',
  admin: 'security',
};
type OutcomeDataPicker = {
  [key in RulesOutcome]: OutcomeData;
};
export const OUTCOME_DATA: OutcomeDataPicker = {
  allow: { theme: 'success', icon: ICON_SELECTOR['allow'], label: 'ALLOW' },
  deny: { theme: 'warning', icon: ICON_SELECTOR['deny'], label: 'DENY' },
  error: { theme: 'warning', icon: ICON_SELECTOR['error'], label: 'ERROR' },
  admin: { theme: 'success', icon: ICON_SELECTOR['admin'], label: 'ADMIN' },
};

// Custom hook that returns the width of the path container,
// a new width is returned after every window resizing is done
export function usePathContainerWidth(
  pathContainerRef: React.RefObject<HTMLDivElement>
): number | undefined {
  const [pathContainerWidth, setPathContainerWidth] = useState<
    number | undefined
  >();

  useEffect(() => {
    const getPathContainerWidth = () => {
      return pathContainerRef?.current?.offsetWidth;
    };
    // Update (pathContainerWidth), debounce helps avoiding unnecessary calls
    const debouncedHandleWindowResize = debounce(() => {
      setPathContainerWidth(getPathContainerWidth());
    }, 150);

    // Set the initial width of path-container
    setPathContainerWidth(getPathContainerWidth());
    // Starts the subscription to window-resizing, and sends a callback
    // that updates the (pathContainerWidth) after every resize.
    window?.addEventListener('resize', debouncedHandleWindowResize);
    // Remove the subscription when the component unmounts
    // (to ensure only one subscription to window-resizing is active at a time)
    return () =>
      window?.removeEventListener('resize', debouncedHandleWindowResize);
  }, [setPathContainerWidth, pathContainerRef]);

  return pathContainerWidth;
}
