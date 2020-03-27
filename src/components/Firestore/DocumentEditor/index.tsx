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
import { getFieldType } from '../utils';
import * as actions from './actions';
import BooleanEditor from './BooleanEditor';
import GeoPointEditor from './GeoPointEditor';
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import {
  DocumentProvider,
  isContainerField,
  isMapChildField,
  useDocumentDispatch,
  useFieldState,
  useRootFields,
  useSdkMap,
  useSiblingFields,
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
  areRootNamesMutable?: boolean;
  areRootFieldsMutable?: boolean;
}> = ({
  value,
  onChange,
  areRootNamesMutable = true,
  areRootFieldsMutable = true,
}) => {
  const methods = useForm({ mode: 'onChange' });

  return (
    <FormContext {...methods}>
      <DocumentProvider value={value}>
        <RootEditor
          onChange={onChange}
          areRootNamesMutable={areRootNamesMutable}
          areRootFieldsMutable={areRootFieldsMutable}
        />
      </DocumentProvider>
    </FormContext>
  );
};

function useErrorCount() {
  const { errors } = useFormContext();
  return Object.keys(errors).length;
}

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootEditor: React.FC<{
  onChange?: (value?: FirestoreMap) => void;
  areRootNamesMutable: boolean;
  areRootFieldsMutable: boolean;
}> = ({ onChange, areRootNamesMutable, areRootFieldsMutable }) => {
  const rootFields = useRootFields();
  const dispatch = useDocumentDispatch()!;
  const sdkMap = useSdkMap();
  const errorCount = useErrorCount();

  useEffect(() => {
    async function validate() {
      if (onChange) {
        if (errorCount === 0) {
          onChange(sdkMap);
        } else {
          onChange(undefined);
        }
      }
    }

    validate();
  }, [errorCount, onChange, sdkMap]);

  return (
    <div className="RootEditor">
      {rootFields.map((field, index) => (
        <FieldEditor
          key={field.id}
          id={field.id}
          isNameMutable={areRootNamesMutable}
        />
      ))}
      {areRootFieldsMutable && (
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
      )}
    </div>
  );
};

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const FieldEditor: React.FC<{
  id: number;
  index?: number;
  isNameMutable: boolean;
}> = ({ id, index, isNameMutable = true }) => {
  const state = useFieldState(id);
  const siblingFields = useSiblingFields(id);
  const dispatch = useDocumentDispatch()!;
  const {
    errors,
    triggerValidation,
    formState: { touched },
  } = useFormContext();

  function handleEditValue(value: FirestorePrimitive) {
    dispatch(actions.updateValue({ id, value }));
  }

  const nameInputName = `${id}-name`;
  const valueInputName = `${id}-value`;

  useEffect(() => {
    // Validate `name` when siblings change
    triggerValidation(nameInputName);
  }, [siblingFields, triggerValidation, nameInputName]);

  return (
    <>
      <div className="FieldEditor">
        {/* Name editor */}
        <Controller
          as={Field}
          name={nameInputName}
          label="Field"
          defaultValue={isMapChildField(state) ? state.name : index}
          onChange={([e]) => {
            // Continue validation while updating the document-store
            dispatch(actions.updateName({ id, name: e.currentTarget.value }));
            return e;
          }}
          disabled={!isNameMutable || index !== undefined}
          rules={{
            required: 'Required',
            validate: {
              unique: e =>
                siblingFields.every(f => {
                  if (isMapChildField(f)) {
                    return f.name !== e;
                  }
                  return true;
                }) || 'Needs to be unique',
            },
          }}
          // Show the `unique` error regardless of the field having been
          // touched; in case another field's name was updated to now conflict
          error={
            (touched[nameInputName] ||
              errors[nameInputName]?.type === 'unique') &&
            errors[nameInputName]?.message
          }
        />

        {/* Type editor */}
        <SelectField
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
          <NumberEditor
            value={state.value}
            onChange={handleEditValue}
            name={valueInputName}
          />
        )}
        {state.type === FieldType.BOOLEAN && (
          <BooleanEditor value={state.value} onChange={handleEditValue} />
        )}
        {state.type === FieldType.GEOPOINT && (
          <GeoPointEditor
            name={valueInputName}
            value={state.value}
            onChange={handleEditValue}
          />
        )}
        {state.type === FieldType.TIMESTAMP && (
          <TimestampEditor
            name={valueInputName}
            value={state.value}
            onChange={handleEditValue}
          />
        )}
        {state.type === FieldType.REFERENCE && (
          <ReferenceEditor
            name={valueInputName}
            value={state.value}
            onChange={handleEditValue}
          />
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

      {isContainerField(state) && (
        <div className="FieldEditor-children">
          {/* Nested fields */}
          {state.childrenIds.map((id, index) => (
            <FieldEditor
              key={id}
              id={id}
              index={state.type === FieldType.ARRAY ? index : undefined}
              isNameMutable={state.type === FieldType.MAP}
            />
          ))}

          {/* Add child */}
          <div className="FieldEditor-add-child">
            <IconButton
              icon="add"
              label="Add field"
              onClick={e => {
                if (state.type === FieldType.MAP) {
                  dispatch(
                    actions.addMapChildField({
                      parentId: id,
                      state: {
                        name: '',
                        type: FieldType.STRING,
                        value: '',
                      },
                    })
                  );
                } else if (state.type === FieldType.ARRAY) {
                  dispatch(
                    actions.addArrayChildField({
                      parentId: id,
                      state: {
                        type: FieldType.STRING,
                        value: '',
                      },
                    })
                  );
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentEditor;
