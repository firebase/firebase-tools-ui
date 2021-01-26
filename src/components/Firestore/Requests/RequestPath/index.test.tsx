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

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import RequestPath from './index';

describe('RequestPath', () => {
  const MOCKED_PATH =
    '/collection1/collection1_ID/subcollection/subcollection_ID';
  const COPY_ICON_TEXT = 'content_copy';

  it('renders complete request path when width of container is big enough', () => {
    const SET_SHOW_COPY_NOTIFICATION = jest.fn();
    const { getByText } = render(
      <RequestPath
        resourcePath={MOCKED_PATH}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        // very big container's width to ensure the whole path fits
        requestPathContainerWidth={1000}
        // Props used for testing purposes only.
        // NOTE: path will not be truncated because the copy-icon-button and the
        // path fit inside the width of the container: (250 + 48) < 1000
        mockedPathOffsetWidth={250}
        mockedIconOffsetWidth={48}
      />
    );
    expect(getByText(MOCKED_PATH)).not.toBeNull();
  });

  it('renders truncated request path when complete path does not fit in width of container', async () => {
    const SET_SHOW_COPY_NOTIFICATION = jest.fn();
    const { findByText } = render(
      <RequestPath
        resourcePath={MOCKED_PATH}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        // very big container's width to ensure the whole path fits
        requestPathContainerWidth={100}
        // Props used for testing purposes only.
        // NOTE: path will be truncated because the copy-icon-button and the
        // path do not fit inside the width of the container: (250 + 48) > 100
        mockedPathOffsetWidth={250}
        mockedIconOffsetWidth={48}
      />
    );
    // regex rule to match a string that starts with '...'
    // NOTE: findByText is useful to wait for truncation to finish
    // and the DOM to be updated
    await expect(findByText(/^.../)).not.toBeNull();
  });

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
        // very big container's width to ensure the whole path fits
        requestPathContainerWidth={1000}
        // Props used for testing purposes only.
        // NOTE: path will not be truncated because the copy-icon-button and the
        // path fit inside the width of the container: (250 + 48) < 1000
        mockedPathOffsetWidth={250}
        mockedIconOffsetWidth={48}
      />
    );
    await act(async () => {
      await fireEvent.click(getByText(COPY_ICON_TEXT));
    });
    expect(SET_SHOW_COPY_NOTIFICATION).toHaveBeenCalledWith(true);
  });
});
