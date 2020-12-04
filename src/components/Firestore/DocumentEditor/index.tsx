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

import './index.scss';

import { IconButton } from '@rmwc/icon-button';
import firebase from 'firebase';
import React, { useEffect } from 'react';
import { FormContext, useForm, useFormContext } from 'react-hook-form';

import { Field, SelectField } from '../../common/Field';
import { FieldType, FirestoreAny, FirestoreMap } from '../models';
import {
  getFieldType,
  isBoolean,
  isGeoPoint,
  isNumber,
  isString,
  isTimestamp,
} from '../utils';
import * as actions from './actions';
import BooleanEditor from './BooleanEditor';
import GeoPointEditor from './GeoPointEditor';
import JsonEditor from './JsonEditor';
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import {
  DocumentStore,
  storeReducer,
  useDispatch,
  useField,
  useStore,
} from './store';
import StringEditor from './StringEditor';
import TimestampEditor from './TimestampEditor';
import {
  Field as DocumentField,
  DocumentPath,
  MapField,
  isArrayField,
  isJSONField,
  isMapField,
} from './types';
import { denormalize, normalize } from './utils';

const FIRESTORE_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.NUMBER,
  FieldType.BOOLEAN,
  FieldType.MAP,
  FieldType.ARRAY,
  FieldType.NULL,
  FieldType.TIMESTAMP,
  FieldType.GEOPOINT,
  FieldType.REFERENCE,
];

/**
 * Firestore does not support nested arrays
 * TODO(tlavelle): consider moving these upstream, and outside
 * of the "DocumentEditor"
 */
const FIRESTORE_ARRAY_FIELD_TYPES = FIRESTORE_FIELD_TYPES.filter(
  ft => ft !== FieldType.ARRAY
);

const RTDB_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.NUMBER,
  FieldType.BOOLEAN,
  FieldType.MAP,
  FieldType.ARRAY,
  FieldType.JSON,
];

const supportedFieldTypeSet = new Set(FIRESTORE_FIELD_TYPES);

export function supportsEditing(value: FirestoreAny): boolean {
  return supportedFieldTypeSet.has(getFieldType(value));
}

/**
 * Entry point for a Document/Field editor
 *
 * areRootKeysMutable: can a root key be changed, this is generally not the case
 *     once a field has been persisted via the SDK.
 * areRootFielsMutable: can a root field be added/removed.
 */
const DocumentEditor: React.FC<{
  value: FirestoreAny;
  onChange?: (value?: FirestoreMap) => void;
  areRootNamesMutable?: boolean;
  areRootFieldsMutable?: boolean;
  rtdb?: boolean;
  startingIndex?: number;
  supportNestedArrays?: boolean;
  firestore?: firebase.firestore.Firestore;
}> = ({
  value,
  onChange,
  areRootNamesMutable,
  areRootFieldsMutable,
  rtdb = false,
  startingIndex,
  supportNestedArrays,
  firestore,
}) => {
  const initialState = normalize(value);
  const [store, dispatch] = React.useReducer(storeReducer, initialState);
  const methods = useForm({ mode: 'onChange' });

  const denormalizedStore = React.useMemo(() => denormalize(store, firestore), [
    store,
    firestore,
  ]);

  const errorCount = React.useMemo(() => Object.keys(methods.errors).length, [
    methods,
  ]);

  useEffect(() => {
    if (errorCount === 0) {
      onChange && onChange(denormalizedStore as FirestoreMap);
    } else {
      onChange && onChange(undefined);
    }
  }, [denormalizedStore, errorCount, onChange]);

  return (
    <FormContext {...methods}>
      <DocumentStore store={store} dispatch={dispatch}>
        <div className="DocumentEditor">
          {
            <>
              {store.uuid !== undefined && (
                <FieldEditor
                  uuid={store.uuid}
                  isRtdb={rtdb}
                  areNamesMutable={areRootNamesMutable}
                  areFieldsMutable={areRootFieldsMutable}
                  startingIndex={startingIndex}
                  supportNestedArrays={supportNestedArrays}
                />
              )}
            </>
          }
        </div>
      </DocumentStore>
    </FormContext>
  );
};

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const FieldEditor: React.FC<{
  uuid: number;
  isRtdb: boolean;
  areNamesMutable?: boolean;
  areFieldsMutable?: boolean;
  startingIndex?: number;
  supportNestedArrays?: boolean;
  isJson?: boolean;
}> = ({
  uuid,
  isRtdb,
  areNamesMutable = true,
  areFieldsMutable = true,
  startingIndex = 0,
  supportNestedArrays = true,
  isJson = false,
}) => {
  const store = useStore();
  const dispatch = useDispatch();
  const field = useField(uuid);

  if (isMapField(field)) {
    const allowedChildTypes = isRtdb ? RTDB_FIELD_TYPES : FIRESTORE_FIELD_TYPES;

    return (
      <div className="DocumentEditor-Map">
        <div className="DocumentEditor-MapEntries">
          {field.mapChildren.map(c => {
            return (
              <div className="DocumentEditor-MapEntry" key={c.uuid}>
                <div className="DocumentEditor-MapEntryMetadata">
                  <NameEditor
                    uuid={uuid}
                    field={field}
                    childId={c.uuid}
                    readonly={!areNamesMutable && uuid === store.uuid}
                  />
                  <span className="Document-TypeSymbol">=</span>
                  <ChildTypeSelect
                    uuid={c.valueId}
                    allowedTypes={allowedChildTypes}
                  />
                </div>
                <FieldEditor uuid={c.valueId} isRtdb={isRtdb} isJson={isJson} />
                {areFieldsMutable && (
                  <IconButton
                    className="DocumentEditor-MapEntryDelete"
                    type="button"
                    icon="delete"
                    label="Remove field"
                    onClick={() =>
                      dispatch(actions.removeFromMap({ uuid, childId: c.uuid }))
                    }
                  />
                )}
              </div>
            );
          })}
          {areFieldsMutable && (
            <IconButton
              label="Add field"
              type="button"
              icon="add"
              onClick={() =>
                dispatch(
                  actions.addToMap({
                    uuid,
                    name: '',
                    value: '',
                  })
                )
              }
            />
          )}
        </div>
      </div>
    );
  } else if (isArrayField(field)) {
    const allowedChildTypes = isRtdb
      ? RTDB_FIELD_TYPES
      : supportNestedArrays
      ? FIRESTORE_FIELD_TYPES
      : FIRESTORE_ARRAY_FIELD_TYPES;

    return (
      <div className="DocumentEditor-Array">
        <div className="DocumentEditor-ArrayEntries">
          {field.arrayChildren.map((c, index) => {
            return (
              <div className="DocumentEditor-ArrayEntry" key={c.uuid}>
                <div className="DocumentEditor-ArrayEntryMetadata">
                  <div className="DocumentEditor-ArrayIndex">
                    <Field
                      value={index + startingIndex}
                      label="Index"
                      disabled
                    />
                  </div>
                  <span className="Document-TypeSymbol">=</span>
                  <ChildTypeSelect
                    uuid={c.valueId}
                    allowedTypes={allowedChildTypes}
                  />
                </div>
                <FieldEditor uuid={c.valueId} isRtdb={isRtdb} />
                {areFieldsMutable && (
                  <IconButton
                    className="DocumentEditor-ArrayEntryDelete"
                    type="button"
                    icon="delete"
                    label="Remove field"
                    onClick={() =>
                      dispatch(
                        actions.removeFromArray({ uuid, childId: c.uuid })
                      )
                    }
                  />
                )}
              </div>
            );
          })}
          {areFieldsMutable && (
            <IconButton
              label="Add field"
              type="button"
              icon="add"
              onClick={() =>
                dispatch(
                  actions.addToArray({
                    uuid,
                    value: '',
                  })
                )
              }
            />
          )}
        </div>
      </div>
    );
  } else if (isJSONField(field)) {
    return (
      <JsonEditor
        name={`${uuid}`}
        value={field.value}
        onChange={value => dispatch(actions.updateValue({ uuid, value }))}
      />
    );
  } else {
    const valueEditor =
      field.value instanceof DocumentPath ? (
        <ReferenceEditor
          name={`${uuid}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : isString(field.value) ? (
        <StringEditor
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : isBoolean(field.value) ? (
        <BooleanEditor
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : isNumber(field.value) ? (
        <NumberEditor
          name={`${uuid}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : isGeoPoint(field.value) ? (
        <GeoPointEditor
          name={`${uuid}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : isTimestamp(field.value) ? (
        <TimestampEditor
          name={`${uuid}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ uuid, value }))}
        />
      ) : null;

    return <div className="DocumentEditor-Primitive">{valueEditor}</div>;
  }
};

const ChildTypeSelect: React.FC<{
  uuid: number;
  allowedTypes: FieldType[];
}> = ({ uuid, allowedTypes }) => {
  const field = useField(uuid);
  const dispatch = useDispatch();

  return (
    <SelectField
      label="Type"
      outlined
      options={allowedTypes}
      value={getDocumentFieldType(field)}
      onChange={e => {
        dispatch(
          actions.updateType({ uuid, type: e.currentTarget.value as FieldType })
        );
      }}
    />
  );
};

const NameEditor: React.FC<{
  uuid: number;
  field: MapField;
  childId: number;
  readonly: boolean;
}> = ({ uuid, field, childId, readonly }) => {
  const {
    register,
    unregister,
    errors,
    clearError,
    setValue,
    setError,
    formState: { touched },
  } = useFormContext();

  const dispatch = useDispatch();
  const child = field.mapChildren.find(c => c.uuid === childId);
  if (!child) {
    throw new Error('Tried to render a name-edtior for a non-map-child');
  }

  const formName = `${childId}`;

  const siblingNames = React.useMemo(() => {
    return field.mapChildren.filter(c => c.uuid !== childId).map(c => c.name);
  }, [field, childId]);

  useEffect(() => {
    register(formName);
    return () => unregister(formName);
  }, [register, unregister, formName]);

  useEffect(() => {
    // Validate `name` when siblings change
    const isUnique = siblingNames.every(name => name !== child.name);
    if (!child.name) {
      setError(formName, 'required', 'Required');
    } else if (!isUnique) {
      setError(formName, 'unique', 'Must be unique');
    } else {
      clearError(formName);
    }
  }, [child, siblingNames, formName, setError, clearError]);

  return (
    <Field
      label="Field"
      outlined
      value={child.name}
      disabled={readonly}
      onChange={e => {
        setValue(formName, e.currentTarget.value);
        dispatch(
          actions.updateName({
            uuid,
            childId,
            name: e.currentTarget.value,
          })
        );
      }}
      // Show the `unique` error regardless of the field having been
      // touched; in case another field's name was updated to now conflict
      error={
        (touched[formName] || errors[formName]?.type === 'unique') &&
        errors[formName]?.message
      }
    />
  );
};

function getDocumentFieldType(field: DocumentField): FieldType {
  if (isMapField(field)) {
    return FieldType.MAP;
  } else if (isArrayField(field)) {
    return FieldType.ARRAY;
  } else if (isJSONField(field)) {
    return FieldType.JSON;
  } else {
    if (field.value instanceof DocumentPath) {
      return FieldType.REFERENCE;
    }
    return getFieldType(field.value);
  }
}

//
export default DocumentEditor;
