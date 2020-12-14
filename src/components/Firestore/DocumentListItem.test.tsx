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

import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router-dom';

import DocumentListItem from './DocumentListItem';

describe('DocumentListItem', () => {
  it('shows the query value when queryFieldValue is string', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { queryByText, queryByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue="foo"
          />
        </Route>
      </Router>
    );

    expect(queryByText('an-item')).not.toBeNull();
    expect(queryByText('"foo"')).not.toBeNull();
    expect(queryByTestId('twoLine')).not.toBeNull();
  });

  it('shows the query value when queryFieldValue is number', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { queryByText, queryByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue={1986}
          />
        </Route>
      </Router>
    );

    expect(queryByText('an-item')).not.toBeNull();
    expect(queryByText('1986')).not.toBeNull();
    expect(queryByTestId('twoLine')).not.toBeNull();
  });

  it('shows the query value when queryFieldValue is boolean', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { queryByText, queryByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue={false}
          />
        </Route>
      </Router>
    );

    expect(queryByText('an-item')).not.toBeNull();
    expect(queryByText('false')).not.toBeNull();
    expect(queryByTestId('twoLine')).not.toBeNull();
  });

  it('shows the query value when queryFieldValue is null', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { queryByText, queryByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue={null}
          />
        </Route>
      </Router>
    );

    expect(queryByText('an-item')).not.toBeNull();
    expect(queryByText('null')).not.toBeNull();
    expect(queryByTestId('twoLine')).not.toBeNull();
  });

  it('does not show the query value when queryFieldValue is undefined', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { debug, queryByText, queryByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue={undefined}
          />
        </Route>
      </Router>
    );

    expect(queryByText('an-item')).not.toBeNull();
    expect(queryByTestId('twoLine')).toBeNull();
  });

  it('redirects to document path when clicking the document list item', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { getByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item"
            url="/my-stuff"
            queryFieldValue="foo"
          />
        </Route>
      </Router>
    );

    fireEvent.click(getByTestId('firestore-document-list-item'));
    expect(history.location.pathname).toBe('/my-stuff/an-item');
  });

  it('redirects to document path when clicking the document list item and the document id has special characters', async () => {
    const history = createMemoryHistory({ initialEntries: ['/firestore'] });
    const { getByTestId } = await render(
      <Router history={history}>
        <Route path="/firestore">
          <DocumentListItem
            docId="an-item@#$"
            url="/my-stuff"
            queryFieldValue="foo"
          />
        </Route>
      </Router>
    );

    fireEvent.click(getByTestId('firestore-document-list-item'));
    expect(history.location.pathname).toBe('/my-stuff/an-item%40%23%24');
  });
});
