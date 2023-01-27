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

import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import type {
  RemoteConfigParameter,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';
import isEqual from 'lodash/isEqual';
import { Suspense, useEffect, useState } from 'react';

import { CardActionBar } from '../common/CardActionBar';
import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { useTemplate } from './api';
import { PublishButton, ResetButton } from './ConfigButtons';
import EditDialog from './EditDialog';
import { QueryBar } from './QueryBar';
import styles from './RemoteConfig.module.scss';
import { TemplateViewer } from './TemplateViewer';

function RemoteConfig() {
  const { template, updateTemplate, revertTemplate, refetchTemplate } = useTemplate();

  const [searchText, setSearchText] = useState('');
  const [edited, setEdited] = useState(false);
  const [paramBeingEdited, editParam] = useState<string | undefined>(undefined);
  const [editTemplate, setEditTemplate] = useState(
    JSON.parse(JSON.stringify(template))
  );

  const editing = isEqual(template, editTemplate) && !edited;

  useEffect(() => {
    if (!isEqual(template, editTemplate) && !edited) {
      setEditTemplate(JSON.parse(JSON.stringify(template)));
    }
  }, [template, editTemplate, edited]);

  async function saveCurrentConfigs() {
    await updateTemplate(editTemplate);
    await refetchTemplate();
    setEdited(false);
  }

  function updateEditTemplate() {
    setEditTemplate(JSON.parse(JSON.stringify(template)));
    setEdited(true);
  }
  async function resetToTemplate() {
    await revertTemplate();
    updateEditTemplate();
    setEdited(false);
  }

  return (
    <GridCell span={12}>
      <div className={editing ? styles.disabledTopActions : styles.enabledTopActions}>
        {!editing ? (
          <div className={styles.unpublishText}>
            <span className="material-icons">error</span>
            <p>Unpublished changes</p>
          </div>
        ) : null}

        <ResetButton reset={resetToTemplate} revertChanges={() => updateEditTemplate()} />
        <PublishButton
          saveCurrentConfigs={saveCurrentConfigs}
          disabled={editing}
        />

      </div>
      <Elevation z="2" wrap>
        <Card>
          <CardActionBar>
            <QueryBar filter={searchText} setFilter={setSearchText} />
          </CardActionBar>
          <TemplateViewer
            rcTemplate={editTemplate}
            paramNameFilter={searchText}
            editParam={(paramName: string) => editParam(paramName)}
            setEditTemplate={setEditTemplate}
          />
          {paramBeingEdited !== undefined ? (
            <EditDialog
              open={paramBeingEdited !== undefined}
              close={() => editParam(undefined)}
              parameterName={paramBeingEdited as string}
              param={editTemplate.parameters[paramBeingEdited]}
              save={(updatedParam: RemoteConfigParameter) => {
                const newTemplate: RemoteConfigTemplate = JSON.parse(
                  JSON.stringify(editTemplate)
                );
                newTemplate.parameters[paramBeingEdited] = updatedParam;
                setEditTemplate(JSON.parse(JSON.stringify(newTemplate)));
                editParam(undefined);
                setEdited(true);
              }}
            />
          ) : null}
        </Card>
      </Elevation>
    </GridCell>
  );
}

const RemoteConfigRouteSuspended: React.FC<React.PropsWithChildren<unknown>> = () => {
  const isDisabled = useIsEmulatorDisabled('remoteconfig');
  return isDisabled ? (
    <EmulatorDisabled productName="Remote Config" />
  ) : (
    <Spinner span={12} message="Remote Config Emulator Loading..." />
  );
};

export default function RemoteConfigWrapper() {
  return (
    <Suspense fallback={<RemoteConfigRouteSuspended />}>
      <RemoteConfig />
    </Suspense>
  );
}
