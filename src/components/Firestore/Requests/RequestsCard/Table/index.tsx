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

import './index.scss';

import {
  DataTable,
  DataTableBody,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from '@rmwc/data-table';
import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../../store';
import {
  getFilteredRequestsEvaluations,
  getShowTable,
  getShowZeroResults,
  getShowZeroState,
} from '../../../../../store/firestore/requests/evaluations/selectors';
import { FirestoreRulesEvaluation } from '../../rules_evaluation_result_model';
import RequestsNoResults from './NoResults';
import RequestsTableRow from './TableRow';
import RequestsZeroState from './ZeroState';

const TABLE_CLASS = 'Firestore-Requests-Table';
const EMPTY_TABLE_CLASS = TABLE_CLASS + '--Empty';

const mapStateToProps = createStructuredSelector({
  filteredRequests: getFilteredRequestsEvaluations,
  shouldShowZeroState: getShowZeroState,
  shouldShowZeroResults: getShowZeroResults,
  shouldShowTable: getShowTable,
});
interface PropsFromStore extends ReturnType<typeof mapStateToProps> {}
interface Props extends PropsFromStore {}

export const RequestsTable: React.FC<Props> = ({
  filteredRequests,
  shouldShowZeroState,
  shouldShowZeroResults,
  shouldShowTable,
}) => (
  <>
    <DataTable
      className={classnames(TABLE_CLASS, !shouldShowTable && EMPTY_TABLE_CLASS)}
    >
      <DataTableContent>
        <DataTableHead>
          <DataTableRow>
            {/* TODO: add onSortChange to toggle sorting value when sorting functionality is ready */}
            <DataTableHeadCell
              className={`${TABLE_CLASS}-Date-Header`}
              sort={1}
            >
              Time
            </DataTableHeadCell>
            <DataTableHeadCell
              className={`${TABLE_CLASS}-Outcome-Header`}
            ></DataTableHeadCell>
            <DataTableHeadCell className={`${TABLE_CLASS}-Method-Header`}>
              Method
            </DataTableHeadCell>
            <DataTableHeadCell className={`${TABLE_CLASS}-Path-Header`}>
              Path
            </DataTableHeadCell>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {shouldShowTable &&
            filteredRequests?.map((request: FirestoreRulesEvaluation) => {
              const { requestId } = request;
              return (
                <RequestsTableRow
                  key={requestId}
                  requestId={requestId}
                  request={request}
                />
              );
            })}
        </DataTableBody>
      </DataTableContent>
    </DataTable>
    {shouldShowZeroResults && <RequestsNoResults />}
    {shouldShowZeroState && <RequestsZeroState />}
  </>
);

export default connect(mapStateToProps)(RequestsTable);
