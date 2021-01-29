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

import '../index.scss';

import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import React, { useEffect, useRef, useState } from 'react';

// Copies path without spaces to clipboard
// and triggers copy notification (SnackBar)
function copyPathToClipboard(
  resourcePath: string,
  setShowCopyNotification: (value: boolean) => void
) {
  if (!navigator?.clipboard?.writeText) {
    throw new Error('Your browser does not support copying to clipboard');
  }
  navigator.clipboard
    .writeText(resourcePath.replace(/\s/g, ''))
    .then(() => setShowCopyNotification(true))
    .catch((error) => {
      setShowCopyNotification(false);
      throw new Error(`Could not copy to clipboard.\n\nReason: ${error}`);
    });
}

// Function that truncates the request path from the left side of the string.
// It first calculates the available width of the pathHtmlElement, and how many
// characters fit inside the width. Based on that, it calculates a new truncated string.
// For optimization purposes, the truncation is always calculated, but the HTMLElement
// is only updated when the new truncated string is different than the HTMLElement's textContent.
function truncateRequestPathFromLeft(
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
    textContent: pathTextString,
    offsetWidth: pathTextWidth,
  } = pathHtmlElement;
  const copyIconButtonWidth = copyButtonElement.current?.offsetWidth || 0;
  // Calculate the width in px of a single character: (totalWidth / totalCharacters)
  // NOTE: Even though the font-family is not monospace (every character may have a different width),
  // this solution is accepted because the pixel approximation varies by only decimals.
  const totalPathCharacters = pathTextString?.length || 0;
  const pathCharacterPxWidth = totalPathCharacters
    ? pathTextWidth / totalPathCharacters
    : 0;
  // End truncation to avoid x/0 division
  if (!pathCharacterPxWidth) {
    return;
  }
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
  if (pathHtmlElement.textContent !== newTruncatedPathString) {
    pathHtmlElement.textContent = newTruncatedPathString;
  }
}

interface Props {
  resourcePath: string;
  setShowCopyNotification: (value: boolean) => void;
  requestPathContainerWidth?: number;
}

const RequestPath: React.FC<Props> = ({
  resourcePath,
  setShowCopyNotification,
  requestPathContainerWidth,
}) => {
  const pathTextRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [prevPathContainerWidth, setPrevPathContainerWidth] = useState<
    number | undefined
  >();

  useEffect(() => {
    // truncate request-path only if the width of the pathContainer changed
    if (requestPathContainerWidth !== prevPathContainerWidth) {
      truncateRequestPathFromLeft(
        pathTextRef,
        copyButtonRef,
        resourcePath,
        requestPathContainerWidth
      );
    }
  }, [
    pathTextRef,
    copyButtonRef,
    resourcePath,
    requestPathContainerWidth,
    prevPathContainerWidth,
  ]);

  // record previous width (useful to identify if the width changed)
  useEffect(() => {
    setPrevPathContainerWidth(requestPathContainerWidth);
  }, [requestPathContainerWidth, setPrevPathContainerWidth]);

  return (
    <div className="Firestore-Request-Path-Container">
      <Tooltip content={resourcePath} align="bottomLeft" enterDelay={400}>
        <div
          className="Firestore-Request-Path-String"
          ref={pathTextRef}
          data-testid="request-path-text"
        >
          {resourcePath}
        </div>
      </Tooltip>
      <Tooltip content="Copy path" align="bottom" enterDelay={400}>
        <IconButton
          className="Firestore-Request-Path-Copy-Button"
          ref={copyButtonRef}
          icon="content_copy"
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            event.stopPropagation();
            copyPathToClipboard(resourcePath, setShowCopyNotification);
          }}
        />
      </Tooltip>
    </div>
  );
};

export default RequestPath;
