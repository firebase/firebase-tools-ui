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
import { Select } from '@rmwc/select';
import { TextField } from '@rmwc/textfield';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  ErrorMessage,
  FormContext,
  useForm,
  useFormContext,
} from 'react-hook-form';

import {
  FieldType,
  FirestoreAny,
  FirestoreMap,
  FirestorePrimitive,
} from '../models';
import {
  getFieldType,
  isArray,
  isBoolean,
  isGeoPoint,
  isMap,
  isNumber,
  isPrimitive,
  isReference,
  isString,
  isTimestamp,
  lastFieldName,
} from '../utils';
import * as actions from './actions';
import BooleanEditor from './BooleanEditor';
import GeoPointEditor from './GeoPointEditor';
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import {
  DocumentProvider,
  useDocumentDispatch,
  useFieldState,
  useRootFields,
  useSdkMap,
} from './store';
import StringEditor from './StringEditor';
import TimestampEditor from './TimestampEditor';

const supportedFieldTypes = [
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

const supportedFieldTypeSet = new Set(supportedFieldTypes);

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
  value: FirestoreMap;
  onChange?: (value?: FirestoreMap) => void;
  areRootKeysMutable?: boolean;
  areRootFieldsMutable?: boolean;
}> = ({
  value,
  onChange,
  areRootKeysMutable = true,
  areRootFieldsMutable = true,
}) => {
  const methods = useForm({ mode: 'onChange' });

  return (
    <FormContext {...methods}>
      <DocumentProvider value={value}>
        <RootEditor
          onChange={onChange}
          areRootKeysMutable={areRootKeysMutable}
          areRootFieldsMutable={areRootFieldsMutable}
        />
      </DocumentProvider>
    </FormContext>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootEditor: React.FC<{
  onChange?: (value?: FirestoreMap) => void;
  areRootKeysMutable: boolean;
  areRootFieldsMutable: boolean;
}> = ({ onChange, areRootKeysMutable, areRootFieldsMutable }) => {
  const rootFields = useRootFields();
  const dispatch = useDocumentDispatch()!;
  const sdkMap = useSdkMap();
  const { watch, triggerValidation } = useFormContext();

  useEffect(() => {
    async function validate() {
      if (onChange) {
        const valid = await triggerValidation();
        if (valid) {
          onChange(sdkMap);
        } else {
          onChange();
        }
      }
    }

    validate();
  }, [onChange, sdkMap]);

  return (
    <div className="RootEditor">
      {rootFields.map((field, index) => (
        <FieldEditor key={field.id} id={field.id} />
      ))}
      <IconButton
        icon="add"
        onClick={() =>
          dispatch(
            actions.addField({
              state: {
                name: '',
                type: FieldType.STRING,
                value: '',
              },
            })
          )
        }
      />
    </div>
  );
};

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const FieldEditor: React.FC<{
  id: number;
  // isKeyMutable: boolean;
}> = ({ id }) => {
  const state = useFieldState(id);
  const dispatch = useDocumentDispatch()!;
  const {
    errors,
    setValue,
    register,
    unregister,
    triggerValidation,
    formState: { dirty, touched },
    reset,
    getValues,
    control,
  } = useFormContext();

  function handleEditValue(value: FirestorePrimitive) {
    dispatch(actions.updateValue({ id, value }));
  }

  const nameInputName = `${id}-name`;
  const valueInputName = `${id}-value`;

  console.log({ errors });

  return (
    <>
      <div className="FieldEditor">
        {/* Name editor */}
        <Controller
          as={TextField}
          name={nameInputName}
          defaultValue={state.name}
          onChange={([e]) => {
            // Continue validation while updating the document-store
            dispatch(actions.updateName({ id, name: e.currentTarget.value }));
            return e;
          }}
          rules={{ required: 'Field name is required' }}
          outlined
          label="Field"
          invalid={touched[nameInputName] && errors[nameInputName]}
        />

        {/* Type editor */}
        <Select
          label="Type"
          outlined
          options={supportedFieldTypes}
          value={state.type}
          onChange={e => {
            dispatch(actions.updateType({ id, type: e.currentTarget.value }));
          }}
        />

        {/* Value editor */}
        {state.type === FieldType.STRING && (
          <StringEditor value={state.value} onChange={handleEditValue} />
        )}

        {state.type === FieldType.NUMBER && (
          <Controller
            as={TextField}
            name={valueInputName}
            defaultValue={state.value}
            onChange={([e]) => {
              // console.log(e);
              // Continue validation while updating the document-store
              // setNumber(e.currentTarget.value);
              // dispatch(
              //   actions.updateValue({
              //     id,
              //     value: e.currentTarget.value as number,
              //   }),
              // );
              return e;
            }}
            onBlur={() => triggerValidation(valueInputName)}
            rules={{ required: 'This is really' }}
            outlined
            label="Value"
            invalid={touched[valueInputName] && errors[valueInputName]}
          />
        )}
        {/*<NumberEditor
            value={state.value}
            onChange={handleEditValue}
            name={valueInputName}
          />*/}
        {state.type === FieldType.BOOLEAN && (
          <BooleanEditor value={state.value} onChange={handleEditValue} />
        )}
        {state.type === FieldType.GEOPOINT && (
          <GeoPointEditor value={state.value} onChange={handleEditValue} />
        )}
        {state.type === FieldType.TIMESTAMP && (
          <TimestampEditor value={state.value} onChange={handleEditValue} />
        )}
        {state.type === FieldType.REFERENCE && (
          <ReferenceEditor value={state.value} onChange={handleEditValue} />
        )}

        {/* Field actions*/}
        <div className="FieldEditor-actions">
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={() => dispatch(actions.deleteField({ id }))}
          />
        </div>
      </div>

      <ErrorMessage errors={errors} name={nameInputName} />

      {(state.type === FieldType.MAP || state.type === FieldType.ARRAY) && (
        <div className="FieldEditor-children">
          {/* Nested fields */}
          {state.childrenIds.map(id => (
            <FieldEditor key={id} id={id} />
          ))}

          {/* Add child */}
          <div className="FieldEditor-add-child">
            <IconButton
              icon="add"
              label="Add field"
              onClick={e =>
                dispatch(
                  actions.addField({
                    parentId: id,
                    state: {
                      name: '',
                      type: FieldType.STRING,
                      value: '',
                    },
                  })
                )
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentEditor;
