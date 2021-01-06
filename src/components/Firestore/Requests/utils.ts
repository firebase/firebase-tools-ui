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

import { formatTimestamp } from '../../LogViewer/History';
import {
  FirestoreRulesEvaluation,
  RulesOutcome,
} from './rules_evaluation_result_model';
import { InspectionElement, RulesOutcomeData } from './types';

// matches the material-icon name by request outcome
const ICON_SELECTOR = {
  allow: 'check_circle',
  deny: 'remove_circle',
  error: 'report_problem',
  admin: 'security',
};

// outputs the detailed data of the request in a clean format
export function getIconFromRequestOutcome(outcome?: RulesOutcome) {
  if (!outcome) {
    return '';
  }
  return ICON_SELECTOR[outcome];
}

// outputs the main data of the request in a clean format
export function useRequestMainInformation(request?: FirestoreRulesEvaluation) {
  if (!request) {
    return [undefined, undefined, undefined, undefined, undefined] as const;
  }

  const { rulesContext, outcome } = request;
  // time * 1000 converts timestamp units from seconds to millis
  const timestamp = rulesContext?.request?.time * 1000;
  const requestTimeComplete = new Date(timestamp).toLocaleString();
  const requestTimeFormatted = formatTimestamp(timestamp);
  const requestMethod = rulesContext?.request?.method;
  // replace root path, split every subpath and remove resulting empty elements
  const resourcePath = rulesContext?.request?.path
    ?.replace('/databases/(default)/documents', '')
    ?.split('/')
    ?.filter((i) => i)
    ?.map((subpath) => `/${subpath}`)
    ?.join('');
  const outcomeData: RulesOutcomeData = {
    allow: { theme: 'success', icon: ICON_SELECTOR['allow'], label: 'ALLOW' },
    deny: { theme: 'warning', icon: ICON_SELECTOR['deny'], label: 'DENY' },
    error: { theme: 'warning', icon: ICON_SELECTOR['error'], label: 'ERROR' },
    admin: { theme: 'success', icon: ICON_SELECTOR['admin'], label: 'ADMIN' },
  };

  return [
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcomeData[outcome],
  ] as const;
}

// outputs the detailed data of the request in a clean format
export function useRequestInspectionElements(
  request?: FirestoreRulesEvaluation
) {
  if (!request) {
    return [undefined, undefined, undefined, undefined] as const;
  }

  const { rulesContext, data, granularAllowOutcomes } = request;
  const firestoreRules = data?.rules;
  const linesOutcome = granularAllowOutcomes;
  const linesIssues = data?.issues;
  const inspectionElements = Object.entries(rulesContext || {}).map(
    ([key, value]) => {
      return {
        label: key,
        value: JSON.stringify(value, null, '\t'),
      } as InspectionElement;
    }
  );

  return [
    firestoreRules,
    linesOutcome,
    linesIssues,
    inspectionElements,
  ] as const;
}

// custom hook that returns the width of the path container,
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

  // update pathContainerWidth, debounce helps avoiding unnecessary calls
  const debouncedHandleWindowResize = useCallback(
    debounce(() => {
      setPathContainerWidth(getPathContainerWidth());
    }, 150),
    [pathContainerRef, setPathContainerWidth, getPathContainerWidth]
  );

  // starts and stops subscription to window resizing,
  // and updates (pathContainerWidth) after every change
  useEffect(() => {
    window?.addEventListener('resize', debouncedHandleWindowResize);
    return () =>
      window?.removeEventListener('resize', debouncedHandleWindowResize);
  }, [debouncedHandleWindowResize]);

  // updates width if HTML reference changes (useful to get initial width)
  useEffect(() => {
    setPathContainerWidth(getPathContainerWidth());
  }, [pathContainerRef, getPathContainerWidth]);

  return pathContainerWidth;
}

// function that based on the width of the complete path's string,
// and the width of the path container: considers if truncation should be applied.
// Only if it should, the new truncated path that fits the container's clientWidth
// is calculated, and the HTML element is updated width the new truncated string.
export function truncateHTMLElementFromLeft(
  pathTextElement: React.RefObject<HTMLDivElement>,
  completeRequestPath: string,
  requestPathContainerWidth?: number,
  prevPathContainerWidth?: number
): void {
  const pathHtmlElement = pathTextElement.current;
  if (!pathHtmlElement || !requestPathContainerWidth) {
    return;
  }
  const {
    offsetWidth: pathTextWidth,
    innerText: pathTextString,
  } = pathHtmlElement;

  // gets the width in px of the copy icon button element, which is a sibling of the pathHtmlElement
  function getCopyIconButtonWidth(): number {
    // '!!' at the end converts any falsy width into a numeric 0
    return pathHtmlElement?.parentElement?.querySelector(
      '#path-copy-icon-button'
    )?.clientWidth!!;
  }
  const copyIconButtonWidth = getCopyIconButtonWidth();

  function shouldTruncateHtmlElement(): boolean {
    if (!requestPathContainerWidth) {
      return false;
    }
    // boolean conditions to truncate text only if necessary
    const textAndCopyIconExceededWidthOfContainer =
      pathTextWidth + copyIconButtonWidth > requestPathContainerWidth;
    const textIsCurrentlyTruncated = pathTextString.includes('...');
    // '!!' at the beginning converts any falsy numeric width into boolean
    const pathContainerWidthIncremented =
      !!prevPathContainerWidth &&
      requestPathContainerWidth > prevPathContainerWidth;

    return (
      textAndCopyIconExceededWidthOfContainer ||
      (textIsCurrentlyTruncated && pathContainerWidthIncremented)
    );
  }

  function truncateHtmlElement(): void {
    if (!pathHtmlElement || !requestPathContainerWidth) {
      return;
    }
    // calculate width in px of a single character: (totalWidth / totalCharacters)
    // (this calculation is not affected by the style of the font)
    const requestPathCharacterPxWidth = pathTextWidth / pathTextString.length;
    // calculate amount of characters that fit into the pathHtmlElement
    // (width of pathHtmlElement is width of path container minus width of copy icon button)
    const stringMaxSize = Math.ceil(
      (requestPathContainerWidth - copyIconButtonWidth) /
        requestPathCharacterPxWidth
    );
    // calculate where to start the truncated substring
    const newRequestPathStart = completeRequestPath.length - stringMaxSize;
    // truncate the path, or return the complete path if there is enough width.
    if (newRequestPathStart > 0) {
      // if the path will be truncated, a (+ 3) is added to compensate the space of the '...' substring
      pathHtmlElement.innerText = `...${completeRequestPath.substr(
        newRequestPathStart + 3
      )}`;
    } else {
      pathHtmlElement.innerText = completeRequestPath;
    }
  }

  if (shouldTruncateHtmlElement()) {
    truncateHtmlElement();
  }
}

// returns an id made out of 20 random upper- and lower-case letters and numbers
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
