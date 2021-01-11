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

import React, { useState } from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllRequestEvaluations } from '../../../../store/firestoreRequestEvaluations/selectors';
import CopyPathNotification from '../CopyPathNotification';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
// import RequestsHeader from './Header';
import RequestsTable from './Table';

interface PropsFromState {
  requests: FirestoreRulesEvaluation[] | undefined;
}
interface Props extends PropsFromState {}

const RequestsTableIndex: React.FC<Props> = ({ requests }) => {
  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(
    false
  );
  const hasRequests = !!requests?.length;

  return (
    <div data-testid="requests-card">
      {/* <RequestsHeader /> */}
      <RequestsTable
        filteredRequests={requests}
        shouldShowTable={hasRequests}
        shouldShowZeroState={!hasRequests}
        setShowCopyNotification={setShowCopyNotification}
      />
      <CopyPathNotification
        showCopyNotification={showCopyNotification}
        setShowCopyNotification={setShowCopyNotification}
      />
    </div>
  );
};
const mapStateToProps = createStructuredSelector({
  requests: getAllRequestEvaluations,
});

export default connect(mapStateToProps)(RequestsTableIndex);
