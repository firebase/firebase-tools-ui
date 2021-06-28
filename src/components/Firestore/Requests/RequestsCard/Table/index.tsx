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
import React, { useRef } from 'react';

import { Callout } from '../../../../common/Callout';
import { useFirestoreRequests } from '../../FirestoreRequestsProvider';
import { FirestoreRulesEvaluation } from '../../rules_evaluation_result_model';
import { usePathContainerWidth } from '../../utils';
import RequestsNoResults from './NoResults';
import RequestsTableRow from './TableRow';
import RequestsZeroState from './ZeroState';

const TABLE_CLASS = 'Firestore-Requests-Table';
const EMPTY_TABLE_CLASS = TABLE_CLASS + '--Empty';

interface Props {
  filteredRequests: FirestoreRulesEvaluation[];
  shouldShowZeroState: boolean;
  shouldShowZeroResults: boolean;
  shouldShowTable: boolean;
  setShowCopyNotification: (show: boolean) => void;
}

export const RequestsTable: React.FC<Props> = ({
  filteredRequests,
  shouldShowZeroState,
  shouldShowZeroResults,
  shouldShowTable,
  setShowCopyNotification,
}) => {
  // References the path header because it has always the same width
  // as the path column, but it renders only once.
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const requestPathContainerWidth = usePathContainerWidth(pathContainerRef);

  return (
    <div className={`${TABLE_CLASS}-Main-Container`}>
      <DataTable
        className={classnames(
          TABLE_CLASS,
          !shouldShowTable && EMPTY_TABLE_CLASS
        )}
      >
        <DataTableContent>
          <DataTableHead theme="surface">
            <DataTableRow>
              {/* TODO: add onSortChange to toggle sorting value when sorting functionality is ready */}
              <DataTableHeadCell className={`${TABLE_CLASS}-Date-Header`}>
                Time
              </DataTableHeadCell>
              <DataTableHeadCell
                className={`${TABLE_CLASS}-Outcome-Header`}
              ></DataTableHeadCell>
              <DataTableHeadCell
                className={`${TABLE_CLASS}-Method-Header`}
                theme="secondary"
              >
                Method
              </DataTableHeadCell>
              <DataTableHeadCell
                className={`${TABLE_CLASS}-Path-Header`}
                theme="secondary"
              >
                {/*
                  (ref) is placed on an inner div to avoid the padding of the Table Header
                  from modifying the returned value of the path container's real width
                */}
                <div ref={pathContainerRef}>Path</div>
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
                    setShowCopyNotification={setShowCopyNotification}
                    requestPathContainerWidth={requestPathContainerWidth}
                  />
                );
              })}
          </DataTableBody>
        </DataTableContent>
      </DataTable>
      {shouldShowZeroResults && <RequestsNoResults />}
      {shouldShowZeroState && <RequestsZeroState />}
      <Callout type="note">
        Only client requests are shown above.{' '}
        <a href="https://firebase.google.com/docs/admin/setup">Admin SDK</a>{' '}
        requests and{' '}
        <a href="https://firebase.google.com/docs/firestore/security/rules-conditions#access_other_documents">
          access calls initiated by Security Rules
        </a>{' '}
        are not listed because they bypass Security Rules.
      </Callout>
    </div>
  );
};

export const RequestsTableWrapper: React.FC<{
  setShowCopyNotification: (show: boolean) => void;
}> = ({ setShowCopyNotification }) => {
  const evaluations = useFirestoreRequests().requests;

  // TODO: Add support for filtering.
  const filteredEvaluations = evaluations;

  return (
    <RequestsTable
      filteredRequests={filteredEvaluations}
      shouldShowZeroState={evaluations.length === 0}
      shouldShowZeroResults={
        evaluations.length > 0 && filteredEvaluations.length === 0
      }
      shouldShowTable={filteredEvaluations.length > 0}
      setShowCopyNotification={setShowCopyNotification}
    />
  );
};

export default RequestsTableWrapper;
