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
  DocumentPath,
  Field as FieldFoo,
  PrimitiveValue,
  Store,
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
  areRootNamesMutable = true,
  areRootFieldsMutable = true,
  rtdb: isRtdb,
}) => {
  const initialState = normalize(value);
  const [store, dispatch] = React.useReducer(storeReducer, initialState);
  const methods = useForm({ mode: 'onChange' });

  const denormalizedStore = React.useMemo(() => denormalize(store), [store]);

  useEffect(() => {
    onChange && onChange(denormalizedStore as FirestoreMap);
  }, [denormalizedStore]);

  return (
    <FormContext {...methods}>
      <DocumentStore store={store} dispatch={dispatch}>
        <div className="DocumentEditor">
          {<>{store.id !== undefined && <FieldEditor id={store.id} />}</>};
        </div>
      </DocumentStore>
    </FormContext>
  );
};

function useErrorCount() {
  const { errors } = useFormContext();
  return Object.keys(errors).length;
}

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const FieldEditor: React.FC<{ id: number }> = ({ id }) => {
  const store = useStore();
  const dispatch = useDispatch();
  const field = useField(id);

  const typeSelect = (
    <SelectField
      label="Type"
      outlined
      options={FIRESTORE_FIELD_TYPES}
      value={getFieldTypeFoo(field)}
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
              {/* Field name */}
              <Field
                label="Field"
                outlined
                value={c.name}
                onChange={e => {
                  dispatch(
                    actions.updateName({
                      id,
                      childId: c.id,
                      name: e.currentTarget.value,
                    })
                  );
                }}
              />
              => <FieldEditor id={c.valueId} />
              <button
                onClick={() =>
                  dispatch(actions.removeFromMap({ id, childId: c.id }))
                }
              >
                x
              </button>
            </div>
          );
        })}
        <button
          onClick={() =>
            dispatch(
              actions.addToMap({
                id,
                name: '',
                value: '',
              })
            )
          }
        >
          add to map
        </button>
      </div>
    );
  } else if (isArrayField(field)) {
    return (
      <div className="DocumentEditor-Array">
        {id !== store.id && typeSelect}
        {field.arrayChildren.map((c, index) => {
          return (
            <div className="DocumentEditor-ArrayEntry" key={c.id}>
              {index} => <FieldEditor id={c.valueId} />
              <button
                onClick={() =>
                  dispatch(actions.removeFromArray({ id, childId: c.id }))
                }
              >
                x
              </button>
            </div>
          );
        })}
        <button
          onClick={() =>
            dispatch(
              actions.addToArray({
                id,
                value: '',
              })
            )
          }
        >
          add to array
        </button>
      </div>
    );
  } else {
    const valueEditor =
      field.value instanceof DocumentPath ? null : isString(field.value) ? (
        <StringEditor
          value={field.value}
          onChange={e => {
            dispatch(actions.updateValue({ id, value: e }));
          }}
        />
      ) : isBoolean(field.value) ? (
        <BooleanEditor
          value={field.value}
          onChange={e => {
            dispatch(actions.updateValue({ id, value: e }));
          }}
        />
      ) : isNumber(field.value) ? (
        <NumberEditor
          name="foobar"
          value={field.value}
          onChange={e => {
            console.log(e);
            dispatch(actions.updateValue({ id, value: e }));
          }}
        />
      ) : isGeoPoint(field.value) ? (
        <GeoPointEditor
          name="foobar"
          value={field.value}
          onChange={e => {
            dispatch(actions.updateValue({ id, value: e }));
          }}
        />
      ) : isTimestamp(field.value) ? (
        <TimestampEditor
          name="foobar"
          value={field.value}
          onChange={e => {
            dispatch(actions.updateValue({ id, value: e }));
          }}
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

function getFieldTypeFoo(field: FieldFoo): FieldType {
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

export default DocumentEditor;
