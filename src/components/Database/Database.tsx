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
import { IconButton } from '@rmwc/icon-button';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useHistory } from 'react-router-dom';

import { initDatabase } from '../../firebase';
import { DatabaseConfig } from '../../store/config';
import { InteractiveBreadCrumbBar } from '../common/InteractiveBreadCrumbBar';
import { DatabaseApi } from './api';
import { ImportDialog } from './DataViewer/ImportDialog';
import { NodeContainer } from './DataViewer/NodeContainer';

export interface PropsFromState {
  namespace: string;
  path?: string;
  config: DatabaseConfig;
}

export type Props = PropsFromState;

const getPrefix = (ref: firebase.database.Reference) => {
  const base = ref.root.toString();
  return base.substring(0, base.length - 1);
};

export const Database: React.FC<Props> = ({ config, namespace, path }) => {
  const [ref, setRef] = useState<firebase.database.Reference | undefined>(
    undefined
  );
  const [api, setApi] = useState<DatabaseApi | undefined>(undefined);

  const history = useHistory();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | undefined>();

  const closeImportDialog = () => {
    setDroppedFile(undefined);
    setImportDialogOpen(false);
  };

  useEffect(() => {
    const [db, { cleanup }] = initDatabase(config, namespace);
    setRef(path ? db.ref(path) : db.ref());

    const api = new DatabaseApi(config, namespace);
    setApi(api);

    return function cleanupDb() {
      cleanup();
      api.delete();
    };
  }, [config, namespace, path]);

  const urlBase = `/database/${namespace}/data`;
  const handleNavigate = (newPath: string) => {
    if (newPath.startsWith('/')) {
      newPath = newPath.substr(1);
    }
    history.push(`${urlBase}/${newPath}`);
  };

  return (
    <div className="Database-Database">
      {ref && api ? (
        <>
          <InteractiveBreadCrumbBar
            base={urlBase}
            path={path || '/'}
            inputPrefix={getPrefix(ref)}
            onNavigate={handleNavigate}
          >
            <SimpleMenu
              handle={<IconButton icon="more_vert" label="Open menu" />}
              renderToPortal
            >
              <MenuItem onClick={() => setImportDialogOpen(true)}>
                Import JSON
              </MenuItem>
            </SimpleMenu>
          </InteractiveBreadCrumbBar>

          <DatabaseDropZone onDrop={f => setDroppedFile(f)}>
            <NodeContainer realtimeRef={ref} isViewRoot />
          </DatabaseDropZone>

          {(importDialogOpen || droppedFile) && (
            <ImportDialog
              api={api}
              reference={ref}
              droppedFile={droppedFile}
              onComplete={closeImportDialog}
            />
          )}
        </>
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
};

export default Database;

/**
 * Renders child content inside a dropzone that will show a scrim and accept
 * JSON files
 */
const DatabaseDropZone: React.FC<{ onDrop: (file: File) => void }> = ({
  onDrop,
  children,
}) => {
  const {
    getInputProps,
    getRootProps,
    isDragActive,
    isDragAccept,
  } = useDropzone({
    onDrop: files => onDrop(files[0]),
    noClick: true,
    accept: 'application/json',
  });

  return (
    <div className="Database-Content" {...getRootProps()}>
      {children}

      {isDragActive && (
        <div className="Database-Content-Dragging">
          {isDragAccept ? (
            'Drop JSON file to import'
          ) : (
            <span className="invalid">
              Only JSON files are supported for data import.
            </span>
          )}
        </div>
      )}

      <input {...getInputProps()} />
    </div>
  );
};
