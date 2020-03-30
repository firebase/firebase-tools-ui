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
import React, { useEffect } from 'react';
import {
  Controller,
  FormContext,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Field, SelectField } from '../../common/Field';
import { ApiProvider, useOptionalApi } from '../ApiContext';
import {
  FieldType,
  FirestoreAny,
  FirestoreMap,
  FirestorePrimitive,
} from '../models';
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
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import {
  DocumentStore,
  reducer,
  storeReducer,
  useDispatch,
  useDocumentStore,
  useField,
  useStore,
} from './store';
import StringEditor from './StringEditor';
import TimestampEditor from './TimestampEditor';
import {
  Field as DocumentField,
  DocumentPath,
  MapField,
  PrimitiveValue,
  Store,
  assertIsMapField,
  isArrayField,
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

const RTDB_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.NUMBER,
  FieldType.BOOLEAN,
  FieldType.MAP,
  FieldType.ARRAY,
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
}> = ({
  value,
  onChange,
  areRootNamesMutable,
  areRootFieldsMutable,
  rtdb = false,
}) => {
  const initialState = normalize(value);
  const [store, dispatch] = React.useReducer(storeReducer, initialState);
  const methods = useForm({ mode: 'onChange' });
  const api = useOptionalApi();

  const denormalizedStore = React.useMemo(() => denormalize(store, api), [
    store,
    api,
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
              {store.id !== undefined && (
                <FieldEditor
                  id={store.id}
                  isRtdb={rtdb}
                  areNamesMutable={areRootNamesMutable}
                  areFieldsMutable={areRootFieldsMutable}
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
  id: number;
  isRtdb: boolean;
  areNamesMutable?: boolean;
  areFieldsMutable?: boolean;
}> = ({ id, isRtdb, areNamesMutable = true, areFieldsMutable = true }) => {
  const store = useStore();
  const dispatch = useDispatch();
  const field = useField(id);

  const typeSelect = (
    <SelectField
      label="Type"
      outlined
      options={isRtdb ? RTDB_FIELD_TYPES : FIRESTORE_FIELD_TYPES}
      value={getDocumentFieldType(field)}
      onChange={e => {
        dispatch(actions.updateType({ id, type: e.currentTarget.value }));
      }}
    />
  );

  if (isMapField(field)) {
    return (
      <div className="DocumentEditor-Map">
        {id !== store.id && typeSelect}
        {field.mapChildren.map(c => {
          return (
            <div className="DocumentEditor-MapEntry" key={c.id}>
              <NameEditor
                id={id}
                field={field}
                childId={c.id}
                readonly={!areNamesMutable && id === store.id}
              />
              => <FieldEditor id={c.valueId} isRtdb={isRtdb} />
              {areFieldsMutable && (
                <IconButton
                  type="button"
                  icon="delete"
                  label="Remove field"
                  onClick={() =>
                    dispatch(actions.removeFromMap({ id, childId: c.id }))
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
                  id,
                  name: '',
                  value: '',
                })
              )
            }
          />
        )}
      </div>
    );
  } else if (isArrayField(field)) {
    return (
      <div className="DocumentEditor-Array">
        {id !== store.id && typeSelect}
        {field.arrayChildren.map((c, index) => {
          return (
            <div className="DocumentEditor-ArrayEntry" key={c.id}>
              {index} => <FieldEditor id={c.valueId} isRtdb={isRtdb} />
              {areFieldsMutable && (
                <IconButton
                  type="button"
                  icon="delete"
                  label="Remove field"
                  onClick={() =>
                    dispatch(actions.removeFromArray({ id, childId: c.id }))
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
                  id,
                  value: '',
                })
              )
            }
          />
        )}
      </div>
    );
  } else {
    const valueEditor =
      field.value instanceof DocumentPath ? (
        <ReferenceEditor
          name={`${id}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : isString(field.value) ? (
        <StringEditor
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : isBoolean(field.value) ? (
        <BooleanEditor
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : isNumber(field.value) ? (
        <NumberEditor
          name={`${id}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : isGeoPoint(field.value) ? (
        <GeoPointEditor
          name={`${id}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : isTimestamp(field.value) ? (
        <TimestampEditor
          name={`${id}`}
          value={field.value}
          onChange={value => dispatch(actions.updateValue({ id, value }))}
        />
      ) : null;

    return (
      <div className="DocumentEditor-Primitive">
        {typeSelect}
        {valueEditor}
      </div>
    );
  }
};

const NameEditor: React.FC<{
  id: number;
  field: MapField;
  childId: number;
  readonly: boolean;
}> = ({ id, field, childId, readonly }) => {
  const {
    register,
    unregister,
    errors,
    triggerValidation,
    clearError,
    setValue,
    setError,
    formState: { touched },
  } = useFormContext();

  const dispatch = useDispatch();
  const child = field.mapChildren.find(c => c.id === childId);
  if (!child) {
    throw 'Tried to render a name-edtior for a non-map-child';
  }

  const formName = `${childId}`;

  const siblingNames = React.useMemo(() => {
    return field.mapChildren.filter(c => c.id !== childId).map(c => c.name);
  }, [field, childId]);

  useEffect(() => {
    register(formName);
    return () => unregister(formName);
  }, [register, unregister, formName]);

  useEffect(() => {
    // Validate `name` when siblings change
    const isUnique = siblingNames.every(name => name != child.name);
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
            id,
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
  } else {
    if (field.value instanceof DocumentPath) {
      return FieldType.REFERENCE;
    }
    return getFieldType(field.value);
  }
}

//
export default DocumentEditor;
