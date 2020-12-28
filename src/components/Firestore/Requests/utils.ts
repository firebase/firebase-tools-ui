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
  allow: 'check',
  deny: 'close',
  error: 'warning',
  admin: 'verified_user',
};
const REQUEST_PATH_CHARACTER_PX_WIDTH = 8.4;
const COPY_ICON_BUTTON_PX_WIDTH = 48;
const PATH_CONTAINER_HORIZONTAL_PADDING = 16;

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
    ?.filter(i => i)
    ?.map(subpath => `/ ${subpath} `)
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
  pathContainerRef:
    | React.RefObject<HTMLElement>
    | React.RefObject<HTMLDivElement>
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
    }, 100),
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

  // substracts the horizontal padding from the returned width
  return (
    pathContainerWidth && pathContainerWidth - PATH_CONTAINER_HORIZONTAL_PADDING
  );
}

// custom hook that based on the width of the complete path's string,
// and the width of the path container: consider if truncation is necessary.
// If it is, the new path that fits the container is calculated and the
// HTML element is updated width the new truncated path.
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
  // boolean conditions to truncate text only if necessary
  const pathContainerWidthIncremented =
    prevPathContainerWidth &&
    requestPathContainerWidth > prevPathContainerWidth;
  const textAndCopyIconExceededWidthOfContainer =
    pathTextWidth + COPY_ICON_BUTTON_PX_WIDTH > requestPathContainerWidth;
  const textIsTruncated = pathTextString.includes('...');
  if (
    textAndCopyIconExceededWidthOfContainer ||
    (textIsTruncated && pathContainerWidthIncremented)
  ) {
    // calculate amount of characters that fit into the div
    // (width of div is width of container minus width of copy Icon)
    const stringMaxSize = Math.ceil(
      (requestPathContainerWidth - COPY_ICON_BUTTON_PX_WIDTH) /
        REQUEST_PATH_CHARACTER_PX_WIDTH
    );
    const newRequestPathStart = completeRequestPath.length - stringMaxSize;
    // truncate the path, or return the complete path if there is enough width
    const newPathString =
      newRequestPathStart > 0
        ? `...${completeRequestPath.substr(newRequestPathStart)}`
        : completeRequestPath;
    // update path in HTML element
    pathHtmlElement.innerText = newPathString;
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
