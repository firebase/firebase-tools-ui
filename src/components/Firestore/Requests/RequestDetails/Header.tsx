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

import './Header.scss';

import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

import { CustomThemeProvider } from '../../../../themes';
import RequestPath from '../RequestPath';
import { OutcomeData } from '../types';
import { usePathContainerWidth } from '../utils';
import RequestActions from './RequestActions';

const RequestDetailsHeader: React.FC<{
  requestTimeComplete: string | undefined;
  requestTimeFormatted: string | undefined;
  requestMethod: string | undefined;
  resourcePath: string | undefined;
  outcomeData: OutcomeData | undefined;
  setShowCopyNotification: (value: boolean) => void;
}> = ({
  requestTimeComplete,
  requestTimeFormatted,
  requestMethod,
  resourcePath,
  outcomeData,
  setShowCopyNotification,
}) => {
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const requestPathContainerWidth = usePathContainerWidth(pathContainerRef);

  return (
    <div className="Firestore-Request-Details-Header">
      <div className="Firestore-Request-Details-Header-Return">
        <Tooltip content="Go back to Table" align="bottom" enterDelay={100}>
          <IconButton
            icon={{ icon: 'arrow_back_ios', size: 'small' }}
            tag={Link}
            to="/firestore/requests"
          />
        </Tooltip>
      </div>
      <div className="Firestore-Request-Details-Header-Info">
        <Tooltip
          content={requestTimeComplete}
          align="bottomRight"
          enterDelay={300}
        >
          <div className="Firestore-Request-Date">{requestTimeFormatted}</div>
        </Tooltip>
        <CustomThemeProvider use={outcomeData?.theme || 'note'} wrap>
          <div className="Firestore-Request-Outcome">
            {outcomeData?.icon && (
              <Tooltip
                content={outcomeData?.label}
                align="bottom"
                enterDelay={100}
              >
                <Icon icon={{ icon: outcomeData?.icon, size: 'medium' }} />
              </Tooltip>
            )}
          </div>
        </CustomThemeProvider>
        <div className="Firestore-Request-Method">{requestMethod}</div>
        <div className="Firestore-Request-Path" ref={pathContainerRef}>
          {resourcePath && (
            <RequestPath
              resourcePath={resourcePath}
              setShowCopyNotification={setShowCopyNotification}
              requestPathContainerWidth={requestPathContainerWidth}
            />
          )}
        </div>
      </div>
      <RequestActions />
    </div>
  );
};

export default RequestDetailsHeader;
