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

import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { CustomThemeProvider } from '../../../../themes';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import { useRequestMainInformation } from '../utils';

const RequestTableRow: React.FC<{
  request: FirestoreRulesEvaluation;
  requestId: string;
  setShowCopyNotification: (value: boolean) => void;
}> = ({ request, requestId, setShowCopyNotification }) => {
  const history = useHistory();
  const [
    requestTimeComplete,
    requestTimeFromNow,
    requestMethod,
    resourcePath,
    outcomeData,
  ] = useRequestMainInformation(request);

  return (
    <tr onClick={() => history.push(`/firestore/requests/${requestId}`)}>
      <CustomThemeProvider use={outcomeData?.theme || 'note'} wrap>
        <td className="Firestore-Request-Outcome" title={outcomeData?.label}>
          {outcomeData?.icon && <Icon icon={{ icon: outcomeData?.icon }} />}
        </td>
      </CustomThemeProvider>
      <td className="Firestore-Request-Method">{requestMethod}</td>
      <td className="Firestore-Request-Path" title={resourcePath}>
        {resourcePath && (
          <div className="Firestore-Request-Path-Container">
            <div>{resourcePath}</div>
            <IconButton
              icon="content_copy"
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
                navigator.clipboard.writeText(resourcePath.replace(/\s/g, ''));
                setShowCopyNotification(true);
              }}
              title="Copy Path"
            />
          </div>
        )}
      </td>
      <td className="Firestore-Request-Date" title={requestTimeComplete}>
        {requestTimeFromNow}
      </td>
    </tr>
  );
};

export default RequestTableRow;
