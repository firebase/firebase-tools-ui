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

import { Button } from '@rmwc/button';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { Field, SelectField } from '../../components/common/Field';
import * as actions from './actions';
import { useCollectionFilter, useDispatch } from './store';

enum CONDITION_OPTIONS {
  NONE = 'No condition',
  EQUAL_TO = '(==) equal to',
  GREATER_THAN = '(>) greater than',
  GREATER_THAN_EQUAL_TO = '(>=) greater than or equal to',
  LESS_THAN = '(<) less than',
  LESS_THAN_EQUAL_TO = '(<=) less than or equal to',
  IN = '(in) equal to any of the following',
  ARRAY_CONTAINS = '(array-contains) an array containing',
  ARRAY_CONTAINS_ANY = '(array-contains-any) an array containing any',
}

export const CollectionFilter: React.FC<{
  path: string;
  onClose?: () => void;
}> = ({ path, onClose }) => {
  const collectionFilter = useCollectionFilter(path);
  const dispatch = useDispatch();
  const { getValues, handleSubmit, register, errors, control, watch } = useForm(
    {
      defaultValues: collectionFilter,
    }
  );
  const {
    fields,
    append,
    prepend,
    remove,
    swap,
    move,
    insert,
  } = useFieldArray({ name: 'condition.entries', control });

  const conditionType = watch('condition.type');
  console.log(conditionType);

  const onSubmit = (values: any) => {
    console.log(values);
    dispatch(
      actions.addCollectionFilter({
        path,
        ...values,
      })
    );
    onClose && onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>{path}</div>

      <Controller as={Field} name="field" control={control} defaultValue="" />

      <Controller
        as={SelectField}
        name="condition.type"
        control={control}
        options={CONDITION_OPTIONS}
        defaultValue=""
      />

      {conditionType !== 'NONE' && (
        <>
          {fields.map((field, index) => (
            <div key={field.id}>
              <Controller
                as={Field}
                name={`condition.entries.${index}`}
                control={control}
                defaultValue=""
              />
            </div>
          ))}
          <Button type="button" onClick={() => append({ foo: '' })}>
            +
          </Button>
        </>
      )}

      <Controller
        as={SelectField}
        name="sort"
        control={control}
        options={['ascending', 'descending']}
        defaultValue=""
      />

      <Button type="submit">Filter</Button>
      <Button
        onClick={() => {
          dispatch(
            actions.removeCollectionFilter({
              path,
            })
          );
          onClose && onClose();
        }}
      >
        Clear filter
      </Button>
    </form>
  );
};
