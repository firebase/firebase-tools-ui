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
import { CollapsibleList, SimpleListItem } from '@rmwc/list';
import { Radio } from '@rmwc/radio';
import { Typography } from '@rmwc/typography';
import React, { useReducer, useState } from 'react';
import {
  Controller,
  FormContext,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { Field, SelectField } from '../../components/common/Field';
import * as actions from './actions';
import styles from './CollectionFilter.module.scss';
import DocumentEditor from './DocumentEditor';
import NumberEditor from './DocumentEditor/NumberEditor';
import {
  CollectionFilter as CollectionFilterType,
  isCollectionFilterConditionMultiple,
  isCollectionFilterConditionSingle,
} from './models';
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
  className: string;
  path: string;
  onClose?: () => void;
}> = ({ className, path, onClose }) => {
  const collectionFilter = useCollectionFilter(path);
  const dispatch = useDispatch();
  // const [sort, setSort] = useState<undefined | string>(undefined);
  const methods = useForm({
    defaultValues: collectionFilter,
  });
  const { getValues, handleSubmit, register, errors, control, watch } = methods;
  const foo = useFieldArray({ name: 'condition.entries', control });
  const { fields, append, prepend, remove, swap, move, insert } = foo;

  const transientCollectionFilter: Partial<CollectionFilterType> = watch({
    nest: true,
  });

  const onSubmit = (collectionFilter: CollectionFilterType) => {
    dispatch(
      actions.addCollectionFilter({
        path,
        ...collectionFilter,
      })
    );
    onClose?.();
  };

  return (
    <FormContext {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        <div>{path}</div>

        <FilterItem title="Filter by field" preview="" open>
          <Controller
            as={Field}
            name="field"
            label="Enter field"
            control={control}
            defaultValue=""
          />
        </FilterItem>

        <FilterItem title="Add condition" preview="">
          <Controller
            as={SelectField}
            name="condition.type"
            label="Only show documents where the specified field is..."
            control={control}
            options={[
              {
                label: 'No condition',
                value: 'unspecified',
              },
              {
                label: 'Equal to',
                value: '==',
              },
              {
                label: 'Greater than',
                value: '>',
              },
              {
                label: 'Array contains',
                value: 'array-contains',
              },
            ]}
            defaultValue="unspecified"
          />

          {transientCollectionFilter.condition &&
            isCollectionFilterConditionSingle(
              transientCollectionFilter.condition
            ) && <DocumentEditor value={true} />}

          {transientCollectionFilter.condition &&
            isCollectionFilterConditionMultiple(
              transientCollectionFilter.condition
            ) && (
              <>
                <Controller
                  as={NumberEditor}
                  name={`condition.entries.0`}
                  control={control}
                  value={0}
                />
                {fields.map((field, index) => {
                  return (
                    index > 0 && (
                      <div key={field.id}>
                        <Controller
                          as={Field}
                          name={`condition.entries.${index}`}
                          control={control}
                          defaultValue=""
                        />
                      </div>
                    )
                  );
                })}
                <Button type="button" onClick={() => append({ foo: '' })}>
                  +
                </Button>
              </>
            )}
        </FilterItem>

        <FilterItem title="Sort results" preview="">
          <Controller
            as={Radio}
            label="Ascending"
            name="sort"
            control={control}
            onChange={([selected]) => {
              return 'ascending';
            }}
            checked={transientCollectionFilter.sort === 'ascending'}
          />

          <Controller
            as={Radio}
            label="Descending"
            name="sort"
            control={control}
            onChange={([selected]) => {
              return 'descending';
            }}
            checked={transientCollectionFilter.sort === 'descending'}
          />
        </FilterItem>

        <Button type="submit">Filter</Button>
        <Button
          type="button"
          onClick={() => {
            dispatch(
              actions.removeCollectionFilter({
                path,
              })
            );
            onClose?.();
          }}
        >
          Clear filter
        </Button>
      </form>
    </FormContext>
  );
};

const ConditionEntry: React.FC<{ value: string | number | boolean }> = ({
  value,
}) => (
  <div>
    <SelectField />
    <div>TODO</div>
  </div>
);

const FilterItem: React.FC<{
  title: string;
  preview: string;
  open?: boolean;
}> = ({ title, preview, open = false, children }) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <CollapsibleList
      defaultOpen={open}
      handle={
        <SimpleListItem
          text={
            <>
              <Typography use="body1">{title}</Typography>
              {isOpen && <Typography use="body1">{preview}</Typography>}
            </>
          }
          metaIcon="chevron_right"
        />
      }
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      {children}
    </CollapsibleList>
  );
};
