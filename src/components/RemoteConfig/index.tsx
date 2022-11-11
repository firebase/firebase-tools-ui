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

import { Suspense, useState } from 'react';
import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';

import { CardActionBar } from '../common/CardActionBar';
import { Spinner } from '../common/Spinner';
import { useTemplate } from './api';
import EditDialog from './EditDialog';
import { QueryBar } from './QueryBar';
import styles from './RemoteConfig.module.scss';
import ResetButton from './Reset';
import { TemplateViewer } from './TemplateViewer';

import type {
  RemoteConfigParameter,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';

function RemoteConfig() {
  const { template, updateTemplate, revertTemplate } = useTemplate();

  const [searchText, setSearchText] = useState('');
  const [paramBeingEdited, editParam] = useState<string | undefined>(undefined);

  return (
    <GridCell span={12}>
      <div className={styles.topActions}>
        <ResetButton reset={revertTemplate} />
      </div>
      <Elevation z="2" wrap>
        <Card>
          <CardActionBar>
            <QueryBar filter={searchText} setFilter={setSearchText} />
          </CardActionBar>
          <TemplateViewer
            rcTemplate={template}
            paramNameFilter={searchText}
            editParam={(paramName: string) => editParam(paramName)}
          />
          {paramBeingEdited !== undefined ? (
            <EditDialog
              open={paramBeingEdited !== undefined}
              close={() => editParam(undefined)}
              parameterName={paramBeingEdited as string}
              param={template.parameters[paramBeingEdited]}
              save={async (updatedParam: RemoteConfigParameter) => {
                const newTemplate: RemoteConfigTemplate = { ...template };
                newTemplate.parameters[paramBeingEdited] = updatedParam;
                await updateTemplate({ ...newTemplate });
                editParam(undefined);
              }}
            />
          ) : null}
        </Card>
      </Elevation>
    </GridCell>
  );
}

export default function RemoteConfigWrapper() {
  return (
    <Suspense fallback={<Spinner span={12} message="Remote Config Emulator Loading..." />}>
      <RemoteConfig />
    </Suspense>
  );
}
