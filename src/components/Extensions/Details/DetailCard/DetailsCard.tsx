/**
 * Copyright 2020 Google LLC
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

import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import React from 'react';

import { useMainDetail } from '../../../common/useMainDetail/useMainDetail';
import { Extension } from '../../models';
import styles from './DetailsCard.module.scss';
import { RelatedLinks } from './RelatedLinks/RelatedLinks';
import { AccessAndRoles } from './Tabs/AccessAndRoles';
import { ApisAndResources } from './Tabs/ApisAndResources';
import ParamList from './Tabs/ParamList';
import { Readme } from './Tabs/Readme';

export interface DetailsCardProps {
  extension: Extension;
}

export const DetailsCard: React.FC<
  React.PropsWithChildren<DetailsCardProps>
> = ({ extension }) => {
  const config = {
    tabs: [
      {
        label: 'How this extension works',
        tab: <Readme />,
      },
      {
        label: 'Extension configuration',
        tab: <ParamList />,
      },
    ],
  };

  if (extension.apis?.length || extension.resources?.length) {
    config.tabs.push({
      label: 'APIs and resources',
      tab: <ApisAndResources />,
    });
  }
  if (extension.roles) {
    config.tabs.push({
      label: 'Access and roles',
      tab: <AccessAndRoles />,
    });
  }

  const { tabs, content } = useMainDetail(config);
  return (
    <Card className={styles.detailsCard}>
      <Elevation z="2" wrap>
        <div className={styles.detailsWrapper}>
          <aside className={styles.detailsAside}>
            <RelatedLinks />
            <div>{tabs}</div>
          </aside>
          <div className={styles.content}>{content}</div>
        </div>
      </Elevation>
    </Card>
  );
};
