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

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import RequestPath from './index';

// Manually set a custom offsetWidth value of a given HTML element
// NOTE: using this mocked values is important because jsdom does not handle
// layouts (which means that every variable that contains a size measurement
// will be equal to 0 during a test)
function setHTMLElementOffsetWidth(
  htmlElement: HTMLElement,
  offsetWidth: number
): void {
  Object.defineProperty(htmlElement, 'offsetWidth', {
    value: offsetWidth,
  });
}

describe('RequestPath', () => {
  const MOCKED_PATH =
    '/collection1/collection1_ID/subcollection/subcollection_ID';
  const COPY_ICON_TEXT = 'content_copy';

  describe('RequestPath => truncation', () => {
    // Helper to avoid duplicating code
    function truncationJSXContent(containersWidth?: number) {
      const SET_SHOW_COPY_NOTIFICATION = jest.fn();
      return (
        <RequestPath
          resourcePath={MOCKED_PATH}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
          requestPathContainerWidth={containersWidth}
        />
      );
    }

    it('renders complete request path when width of container is big enough', () => {
      // Prop of width of container is not yet given
      // (simulates the behavior of the width not yet been calculated)
      const { getByText, getByTestId, rerender } = render(
        truncationJSXContent()
      );
      const pathHtmlElement = getByTestId('request-path-text');
      const copyIconButtonHtmlElement = getByText(COPY_ICON_TEXT);
      setHTMLElementOffsetWidth(pathHtmlElement, 250);
      setHTMLElementOffsetWidth(copyIconButtonHtmlElement, 48);
      // Rerender RequestPath with new path-container width
      // NOTE: re-rendering is important because we want the
      // new mocked offsetWidth values to be used
      // NOTE: path will not be truncated because the copy-icon-button and the
      // path fit inside the width of the container: (250 + 48) < 1000
      rerender(truncationJSXContent(1000));
      expect(pathHtmlElement.textContent).toBe(MOCKED_PATH);
    });

    it('renders truncated request path when complete path does not fit in width of container', async () => {
      // Prop of width of container is not yet given
      // (simulates the behavior of the width not yet been calculated)
      const { getByText, getByTestId, rerender } = render(
        truncationJSXContent()
      );
      const pathHtmlElement = getByTestId('request-path-text');
      const copyIconButtonHtmlElement = getByText(COPY_ICON_TEXT);
      setHTMLElementOffsetWidth(pathHtmlElement, 250);
      setHTMLElementOffsetWidth(copyIconButtonHtmlElement, 48);
      // Rerender RequestPath with new path-container width
      // NOTE: re-rendering is important because we want the
      // new mocked offsetWidth values to be used
      // NOTE: path will be truncated because the copy-icon-button and the
      // path do not fit inside the width of the container: (250 + 48) > 100
      rerender(truncationJSXContent(100));
      // regex rule to match a string that starts with '...'
      // NOTE: waitFor is important to wait for truncation function to finish
      await waitFor(() => expect(pathHtmlElement.textContent).toMatch(/^.../));
    });
  });

  describe('RequestPath => copy-icon-button', () => {
    it('renders copy-icon-button', () => {
      const SET_SHOW_COPY_NOTIFICATION = jest.fn();
      const { getByText } = render(
        <RequestPath
          resourcePath={MOCKED_PATH}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      );
      expect(getByText(COPY_ICON_TEXT)).not.toBeNull();
    });

    // TODO: test the snackbar behavior to appear after click
    // using a more intuitive approach: test if the component is
    // hidden or not by testing css styles
    it('set showCopyNotification to true when the copy-button-icon is clicked', async () => {
      const SET_SHOW_COPY_NOTIFICATION = jest.fn();
      const { getByText } = render(
        <RequestPath
          resourcePath={MOCKED_PATH}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      );
      await act(async () => {
        await fireEvent.click(getByText(COPY_ICON_TEXT));
      });
      expect(SET_SHOW_COPY_NOTIFICATION).toHaveBeenCalledWith(true);
    });
  });
});
