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

import { IconButton } from '@rmwc/icon-button';
import React from 'react';
import { Link } from 'react-router-dom';

import { CustomThemeProvider } from '../../../../themes';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import { useRequestMainInformation } from '../utils';

const RequestTableRow: React.FC<{
  request: FirestoreRulesEvaluation;
  requestId: string;
}> = ({ request, requestId }) => {
  const [
    requestTimeComplete,
    requestTimeFromNow,
    requestMethod,
    resourceSubPaths,
    outcomeData,
  ] = useRequestMainInformation(request);

  return (
    <tr>
      <CustomThemeProvider use={outcomeData?.theme || 'note'} wrap>
        <td className="Firestore-Request-Outcome" title={outcomeData?.label}>
          {outcomeData?.icon && (
            <IconButton
              icon={outcomeData?.icon}
              tag={Link}
              to={`/firestore/requests/${requestId}`}
            />
          )}
        </td>
      </CustomThemeProvider>
      <td className="Firestore-Request-Method">{requestMethod}</td>
      <td className="Firestore-Request-Path-Container">
        <div className="Firestore-Requests-Table-SubPaths-Container">
          {resourceSubPaths?.map((subpath, index) => (
            <React.Fragment key={`${subpath}-${index}`}>
              <span className="Firestore-Request-Path-Slash"> / </span>
              <span
                title="copy subpath"
                className="Firestore-Request-Path-Subpath"
                onClick={() => {
                  navigator.clipboard.writeText(subpath);
                }}
              >
                {' '}
                {subpath}{' '}
              </span>
            </React.Fragment>
          ))}
        </div>
      </td>
      <td className="Firestore-Request-Date" title={requestTimeComplete}>
        {requestTimeFromNow}
      </td>
    </tr>
  );
};

export default RequestTableRow;
