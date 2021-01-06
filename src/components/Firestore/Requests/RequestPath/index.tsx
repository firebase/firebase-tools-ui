/**
 * Copyright 2019 Google LLC
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

import { considerTruncatingHTMLElementFromLeft } from '../utils';

// copies path without spaces to clipboard
// and triggers copy notification (SnackBar)
function copyPathToClipboard(
  resourcePath: string,
  setShowCopyNotification: (value: boolean) => void
) {
  navigator.clipboard
    .writeText(resourcePath.replace(/\s/g, ''))
    .then(() => setShowCopyNotification(true))
    .catch(() => setShowCopyNotification(false));
}

const RequestPath: React.FC<{
  resourcePath: string;
  setShowCopyNotification: (value: boolean) => void;
  requestPathContainerWidth?: number;
}> = ({ resourcePath, setShowCopyNotification, requestPathContainerWidth }) => {
  const pathTextRef = useRef<HTMLDivElement>(null);
  const [prevPathContainerWidth, setPrevPathContainerWidth] = useState<
    number | undefined
  >();

  useEffect(() => {
    // consider truncation only if the width of the pathContainer changed
    requestPathContainerWidth !== prevPathContainerWidth &&
      considerTruncatingHTMLElementFromLeft(
        pathTextRef,
        resourcePath,
        requestPathContainerWidth,
        prevPathContainerWidth
      );
  }, [
    pathTextRef,
    resourcePath,
    requestPathContainerWidth,
    prevPathContainerWidth,
  ]);

  useEffect(() => {
    setPrevPathContainerWidth(requestPathContainerWidth);
  }, [
    requestPathContainerWidth,
    prevPathContainerWidth,
    setPrevPathContainerWidth,
  ]);

  return (
    <div className="Firestore-Request-Path-Container">
      <Tooltip content={resourcePath} align="bottomLeft" enterDelay={400}>
        <div ref={pathTextRef}>{resourcePath}</div>
      </Tooltip>
      <Tooltip content="Copy Path" align="bottom" enterDelay={200}>
        <IconButton
          id="path-copy-icon-button"
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
