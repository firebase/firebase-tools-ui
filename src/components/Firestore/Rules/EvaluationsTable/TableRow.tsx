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
import { useEvaluationMainInformation } from '../utils';

const EvaluationTableRow: React.FC<{
  evaluation: FirestoreRulesEvaluation;
  evaluationId: string;
}> = ({ evaluation, evaluationId }) => {
  const [
    requestTimeComplete,
    requestTimeFromNow,
    requestMethod,
    resourceSubPaths,
    outcomeData,
  ] = useEvaluationMainInformation(evaluation);

  return (
    <tr>
      <CustomThemeProvider use={outcomeData?.theme || 'note'} wrap>
        <td className="Firestore-Evaluation-Outcome" title={outcomeData?.label}>
          {outcomeData?.icon && (
            <IconButton
              icon={outcomeData?.icon}
              tag={Link}
              to={`/firestore/rules/${evaluationId}`}
            />
          )}
        </td>
      </CustomThemeProvider>
      <td className="Firestore-Evaluation-Method">{requestMethod}</td>
      <td className="Firestore-Evaluation-Path-Container">
        <div className="Firestore-Evaluations-Table-SubPaths-Container">
          {resourceSubPaths?.map((subpath, index) => (
            <React.Fragment key={`${subpath}-${index}`}>
              <span className="Firestore-Evaluation-Path-Slash"> / </span>
              <span
                title="copy subpath"
                className="Firestore-Evaluation-Path-Subpath"
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
      <td className="Firestore-Evaluation-Date" title={requestTimeComplete}>
        {requestTimeFromNow}
      </td>
    </tr>
  );
};

export default EvaluationTableRow;
