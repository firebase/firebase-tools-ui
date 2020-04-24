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
import { Radio, RadioHTMLProps, RadioProps } from '@rmwc/radio';
import { Select, SelectProps } from '@rmwc/select';
import { TextField, TextFieldHTMLProps, TextFieldProps } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';
import {
  Controller,
  FormContext,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Field, SelectField } from '../../components/common/Field';
import * as actions from './actions';
import styles from './CollectionFilter.module.scss';
import {
  CollectionFilter as CollectionFilterType,
  Condition,
  isCollectionFilterConditionMultiple,
  isCollectionFilterConditionSingle,
  isSortableCondition,
} from './models';
import { useCollectionFilter, useDispatch } from './store';
import { isBoolean, isNumber, isString } from './utils';

export const CollectionFilter: React.FC<{
  className: string;
  path: string;
  onClose?: () => void;
}> = ({ className, path, onClose }) => {
  const collectionFilter = useCollectionFilter(path);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(0);

  // const defaultValues: CollectionFilterType = {
  //   // values: [''],
  //   // field: '',
  //   // operator: undefined,
  //   ...collectionFilter,
  //   // condition: {
  //   //   type: undefined,
  //   //   value: '',
  //   //   values: [''],
  //   //   ...collectionFilter?.condition,
  //   // },
  // };

  const methods = useForm<CollectionFilterType>({
    mode: 'onChange',
    defaultValues: {
      ...collectionFilter,
    },
  });

  const { handleSubmit, watch } = methods;

  // const transientCollectionFilter: CollectionFilterType = watch({
  //   nest: true,
  // });

  //const sortableCondition = isSortableCondition(transientCollectionFilter);

  const onSubmit = (data: CollectionFilterType) => {
    console.log(data);
    dispatch(
      actions.addCollectionFilter({
        path,
        ...data,
      })
    );
    // onClose?.();
  };

  const fieldPreview: string = ''; // watch('field');
  const fieldPreviewStringified = JSON.stringify(fieldPreview);

  const operatorPreview: string | undefined = '';
  // watch('operator') && JSON.stringify(watch('operator'));
  const valuePreview: string = JSON.stringify(
    ''
    // watch('value') || watch('values')
  );

  const conditionPreview =
    operatorPreview && `${operatorPreview}, ${valuePreview}`;

  const sortPreview: string = ''; // watch('sort') || '';
  const sortPreviewStringified = JSON.stringify(sortPreview);

  return (
    <FormContext {...methods} watch={watch}>
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        {/* Field entry */}
        <FilterItem title="Filter by field" preview={fieldPreview} defaultOpen>
          {/*<Controller
            as={Field}
            name="field"
            label="Enter field"
            defaultValue=""
          />*/}
        </FilterItem>

        {/* Condition entry */}
        <FilterItem
          title="Add condition"
          preview={conditionPreview}
          defaultOpen
        >
          {/*<ConditionBuilder />*/}
        </FilterItem>

        {/* Sort entry */}
        <FilterItem title="Sort results" preview={sortPreview} defaultOpen>
          {/*<SortRadioGroup
            name="sort"
            disabled={!isSortableCondition(transientCollectionFilter)}
          />*/}
        </FilterItem>

        <div>
          <div>.collection({`${JSON.stringify(path)}`})</div>
          {conditionPreview && (
            <div>
              .where(
              {`${fieldPreviewStringified}, ${conditionPreview}`})
            </div>
          )}
          {sortPreview && (
            <div>
              .orderBy({`${fieldPreviewStringified}, ${sortPreviewStringified}`}
              )
            </div>
          )}
        </div>

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

const FilterPreview: React.FC<{ path: string }> = ({ path }) => {
  const collectionId = path.split('/').pop();
  return <div>.collection({`${collectionId}`})</div>;
};

const ConditionBuilder: React.FC = () => {
  const { reset, setValue, watch } = useFormContext();
  const condition = (watch({ nest: true }) as unknown) as Condition;

  const options: Array<{ label: string; value: firestore.WhereFilterOp }> = [
    {
      label: '(==) equal to',
      value: '==',
    },
    {
      label: '(>) greater than',
      value: '>',
    },
    {
      label: '(>=) greater than or equal to',
      value: '>=',
    },
    {
      label: '(<) less than',
      value: '<',
    },
    {
      label: '(<=) less than or equal to',
      value: '<=',
    },
    {
      label: '(in) equal to any of the following',
      value: 'in',
    },
    {
      label: '(array-contains) an array containing',
      value: 'array-contains',
    },
    {
      label: '(array-contains-any) an array containing any',
      value: 'array-contains-any',
    },
  ];

  return (
    <>
      <Controller
        as={SelectField}
        name="operator"
        label="Only show documents where the specified field is..."
        placeholder="No condition"
        options={options}
        onChange={([selected]) => {
          if (selected.currentTarget.value === 'in') {
            console.log('in-detected');
            setValue('values.0', '');
          }
          return selected.currentTarget.value || undefined;
        }}
      />

      {condition && isCollectionFilterConditionSingle(condition) && (
        <ConditionEntry name="value" />
      )}

      {condition && isCollectionFilterConditionMultiple(condition) && (
        <ConditionEntries name="values" />
      )}
    </>
  );
};

const ConditionEntries: React.FC<{ name: string }> = ({ name }) => {
  const { fields, append, remove } = useFieldArray({
    name,
  });

  useEffect(() => {
    if (fields.length < 1) {
      append({ _: '' });
    }
  }, [fields]);

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          <ConditionEntry name={`${name}[${index}]`} />
          <Button type="button" onClick={() => remove(index)}>
            -
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ _: '' })}>
        +
      </Button>
    </>
  );
};

const SortRadioGroup: React.FC<{ name: string; disabled: boolean }> = ({
  name,
  disabled,
}) => {
  const { register, setValue, unregister, watch } = useFormContext();

  useEffect(() => {
    if (!disabled) {
      register({ name });
    } else {
      setValue(name, undefined);
    }

    return () => unregister(name);
  }, [register, disabled]);

  const sort = watch(name);

  return (
    <>
      <Radio
        value="asc"
        label="Ascending"
        checked={sort === 'asc'}
        onChange={() => setValue(name, 'asc')}
        disabled={disabled}
      />

      <Radio
        value="desc"
        label="Descending"
        checked={sort === 'desc'}
        onChange={() => setValue(name, 'desc')}
        disabled={disabled}
      />
    </>
  );
};

function getConditionEntryType(value: any) {
  if (isBoolean(value)) {
    return 'boolean';
  }
  if (isNumber(value)) {
    return 'number';
  }
  return 'string';
}

const ConditionEntry: React.FC<{
  name: string;
  error?: string;
}> = React.memo(({ name, error }) => {
  const { setValue, reset, triggerValidation, watch } = useFormContext();
  const value = watch(name);
  const [fieldType, setFieldType] = useState(getConditionEntryType(value));

  const numberRegex = /^-?([\d]*\.?[\d+]|Infinity|NaN)$/;

  return (
    <div>
      <SelectField
        options={['string', 'number', 'boolean']}
        value={fieldType}
        onChange={evt => {
          setFieldType(evt.currentTarget.value);
        }}
      />

      {fieldType === 'string' && (
        <Controller as={Field} name={name} defaultValue="" error={error} />
      )}

      {fieldType === 'number' && (
        <Controller
          as={Field}
          name={name}
          defaultValue={''}
          rules={{
            pattern: {
              value: numberRegex,
              message: 'Must be a number',
            },
          }}
          error={error}
          onChange={([event]) =>
            // Cast it back to a number before saving to model
            event.target.value.match(numberRegex)
              ? parseFloat(event.target.value)
              : event.target.value
          }
        />
      )}

      {fieldType === 'boolean' && <BooleanCondition name={name} />}
    </div>
  );
});

// RMWC select-menus do not work well with boolean values, requiring
// custom-registration w/ the parent form
const BooleanCondition: React.FC<{ name: string }> = ({ name }) => {
  const { register, setValue, unregister, watch } = useFormContext();

  useEffect(() => {
    register({ name });
    setValue(name, true);

    return () => unregister(name);
  }, [register]);

  const selectValue = watch(name);

  return (
    <SelectField
      name={name}
      options={['true', 'false']}
      value={selectValue}
      onChange={evt => setValue(name, evt.currentTarget.value === 'true')}
    />
  );
};

// Accordian-view for expanding/collapsing panels in the query-view
const FilterItem: React.FC<{
  title: string;
  preview?: string;
  defaultOpen: boolean;
}> = ({ title, preview, defaultOpen, children }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <CollapsibleList
      defaultOpen={expanded}
      handle={
        <SimpleListItem
          text={
            <>
              <Typography use="body1">{title}</Typography>
              {!expanded && preview && (
                <Typography use="body1">{preview}</Typography>
              )}
            </>
          }
          metaIcon="chevron_right"
          className={styles.header}
        />
      }
      onOpen={() => setExpanded(true)}
      onClose={() => setExpanded(false)}
    >
      <div className={styles.children}>{children}</div>
    </CollapsibleList>
  );
};
