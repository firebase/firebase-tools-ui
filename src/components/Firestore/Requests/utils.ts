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

import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';

import { OutcomeData } from './types';

// Matches the material-icon name by request outcome
export const ICON_SELECTOR = {
  allow: 'check_circle',
  deny: 'remove_circle',
  error: 'report_problem',
  admin: 'security',
};
interface OutcomeDataPicker {
  [outcome: string]: OutcomeData;
}
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

  const getPathContainerWidth = useCallback(() => {
    return pathContainerRef?.current?.offsetWidth;
  }, [pathContainerRef]);

  // Update (pathContainerWidth), debounce helps avoiding unnecessary calls
  const debouncedHandleWindowResize = useCallback(
    debounce(() => {
      setPathContainerWidth(getPathContainerWidth());
    }, 150),
    [setPathContainerWidth, getPathContainerWidth]
  );

  // Starts the subscription to window-resizing, and sends a callback
  // that updates the (pathContainerWidth) after every resize.
  // NOTE: this code only executes the first time the component renders,
  // and it makes sure to remove the subscription when the component unmounts
  // (to ensure only one subscription to window-resizing is active at a time)
  useEffect(() => {
    window?.addEventListener('resize', debouncedHandleWindowResize);
    return () =>
      window?.removeEventListener('resize', debouncedHandleWindowResize);
  }, [debouncedHandleWindowResize]);

  // Set the initial width of path-container
  // NOTE: this code only executes the first time the component renders
  useEffect(() => {
    setPathContainerWidth(getPathContainerWidth());
  }, [pathContainerRef, getPathContainerWidth]);

  return pathContainerWidth;
}

// Function that truncates the request path from the left side of the string.
// It first calculates the available width of the pathHtmlElement, and how many
// characters fit inside the width. Based on that, it calculates a new truncated string.
// For optimization purposes, the truncation is always calculated, but the HTMLElement
// is only updated when the new truncated string is different than the HTMLElement's innerText.
export function truncateRequestPathFromLeft(
  pathTextElement: React.RefObject<HTMLDivElement>,
  copyButtonElement: React.RefObject<HTMLButtonElement>,
  fullRequestPath: string,
  pathContainerWidth?: number
): void {
  const pathHtmlElement = pathTextElement.current;
  if (!pathHtmlElement || !pathContainerWidth) {
    return;
  }
  const {
    offsetWidth: pathTextWidth,
    innerText: pathTextString,
  } = pathHtmlElement;
  const copyIconButtonWidth = copyButtonElement.current?.offsetWidth || 0;
  // Calculate the width in px of a single character: (totalWidth / totalCharacters)
  // NOTE: Even though the font-family is not monospace (every character may have a different width),
  // this solution is accepted because the pixel approximation varies by only decimals.
  const pathCharacterPxWidth = pathTextWidth / pathTextString.length;
  // Calculate amount of characters that fit inside the pathHtmlElement: (totalWidth / widthPerCharacter)
  // NOTE: Math.floor is chosen over Math.ceil to ensure there is a small space
  // between the request-path and the copy-button
  const pathHtmlElementAvailableWidth =
    pathContainerWidth - copyIconButtonWidth;
  const newPathMaxCharacters = Math.floor(
    pathHtmlElementAvailableWidth / pathCharacterPxWidth
  );
  // Calculate where to start the truncated substring
  const newPathStart = fullRequestPath.length - newPathMaxCharacters;
  // Truncate the path only if the full path doesn't fit in the HTMLElement,
  // otherwise just set the new path-string to be the full request-path.
  // NOTE: If the path will be truncated, a '...' substring is prepended (added at the begining
  // of the path) and a (+ 3) is added to the substring initial-index to compensate
  // the space of the '...' characters ('...' replaces the first 3 characters of the truncated path)
  const newTruncatedPathString =
    newPathStart > 0
      ? `...${fullRequestPath.substr(newPathStart + 3)}`
      : fullRequestPath;
  // Only update the HTMLElement's inner-text if the string value changed
  // after truncation (to avoid unnecessary rerenders of component)
  if (pathHtmlElement.innerText !== newTruncatedPathString) {
    pathHtmlElement.innerText = newTruncatedPathString;
  }
}

// Returns an id made out of 20 random upper- and lower-case letters and numbers
// TODO: Remove generateId function once the backend itself generates a UID for each request
export function generateId(): string {
  let newId = '';
  let options = 'ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnoqrstuvwyz0123456789';
  const ID_SIZE = 20;

  for (let i = 0; i < ID_SIZE; i++) {
    newId += options.charAt(Math.floor(Math.random() * options.length));
  }
  return newId;
}
