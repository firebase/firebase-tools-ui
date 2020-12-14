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
import './index.scss';

import { Snackbar, SnackbarOnCloseEventT } from '@rmwc/snackbar';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllRequestEvaluations } from '../../../../store/firestoreRequestEvaluations/selectors';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import RequestsTableRow from './TableRow';

export interface PropsFromState {
  requests: FirestoreRulesEvaluation[] | undefined;
}

export type Props = PropsFromState;

const RequestsTable: React.FC<Props> = ({ requests }) => {
  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(
    false
  );

  return (
    <>
      <table className="Firestore-Requests-Table">
        <thead>
          <tr>
            <th className="Firestore-Requests-Table-Outcome-Header"></th>
            <th className="Firestore-Requests-Table-Method-Header">Method</th>
            <th className="Firestore-Requests-Table-Path-Header">Path</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {requests?.map((request: FirestoreRulesEvaluation) => {
            const { requestId } = request;
            return (
              <RequestsTableRow
                key={requestId}
                requestId={requestId}
                request={request}
                setShowCopyNotification={setShowCopyNotification}
              />
            );
          })}
        </tbody>
      </table>
      <Snackbar
        open={showCopyNotification}
        onClose={(evt: SnackbarOnCloseEventT) => setShowCopyNotification(false)}
        message="Path copied to clipboard"
        icon={{ icon: 'check_circle', size: 'medium' }}
      />
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  requests: getAllRequestEvaluations,
});

export default connect(mapStateToProps)(RequestsTable);
