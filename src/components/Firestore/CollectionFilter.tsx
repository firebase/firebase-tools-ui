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
import { CardActionButton, CardActionButtons, CardActions } from '@rmwc/card';
import { IconButton } from '@rmwc/icon-button';
import { CollapsibleList, SimpleListItem } from '@rmwc/list';
import { Radio } from '@rmwc/radio';
import { Theme, ThemeProvider } from '@rmwc/theme';
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

import { grey100 } from '../../colors';
import { Field, SelectField } from '../../components/common/Field';
import * as actions from './actions';
import styles from './CollectionFilter.module.scss';
import {
  CollectionFilter as CollectionFilterType,
  isMultiValueCollectionFilter,
  isSingleValueCollectionFilter,
  isSortableCollectionFilter,
} from './models';
import { useCollectionFilter, useDispatch } from './store';
import { isBoolean, isNumber } from './utils';

export const CollectionFilter: React.FC<{
  className?: string;
  path: string;
  onClose?: () => void;
}> = ({ className, path, onClose }) => {
  const collectionFilter = useCollectionFilter(path);
  const dispatch = useDispatch();

  const formMethods = useForm<CollectionFilterType>({
    mode: 'onChange',
    defaultValues: collectionFilter,
  });

  const cf = formMethods.watch({ nest: true });

  const onSubmit = (data: CollectionFilterType) => {
    dispatch(
      actions.addCollectionFilter({
        path,
        ...data,
      })
    );
    onClose?.();
  };

  return (
    <CollectionFilterTheme>
      <FormContext {...(formMethods as any)}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className={className}
        >
          {/* Field entry */}
          <FilterItem title="Filter by field" preview={cf.field} defaultOpen>
            <Controller
              as={Field}
              name="field"
              label="Enter field"
              defaultValue=""
            />
          </FilterItem>

          {/* Condition entry */}
          <FilterItem
            title="Add condition"
            preview={<ConditionPreview cf={cf} />}
            defaultOpen
          >
            <ConditionSelect>
              {cf && isSingleValueCollectionFilter(cf) && (
                <ConditionEntry name="value" />
              )}

              {cf && isMultiValueCollectionFilter(cf) && (
                <ConditionEntries name="values" />
              )}
            </ConditionSelect>
          </FilterItem>

          {/* Sort entry */}
          <FilterItem
            title="Sort results"
            preview={isSortableCollectionFilter(cf) && cf.sort}
            defaultOpen
          >
            <SortRadioGroup
              name="sort"
              disabled={!isSortableCollectionFilter(cf)}
            />
          </FilterItem>

          <Preview path={path} cf={cf} />

          <CardActions className={styles.actions}>
            <CardActionButtons>
              <CardActionButton
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
                Clear
              </CardActionButton>
            </CardActionButtons>
            <CardActionButtons>
              <CardActionButton type="button" onClick={() => onClose?.()}>
                Cancel
              </CardActionButton>
              <CardActionButton
                unelevated
                type="submit"
                disabled={!formMethods.formState.isValid}
              >
                Apply
              </CardActionButton>
            </CardActionButtons>
          </CardActions>
        </form>
      </FormContext>
    </CollectionFilterTheme>
  );
};

const CollectionFilterTheme: React.FC = ({ children }) => (
  <ThemeProvider options={{ background: grey100, surface: '#fff' }}>
    <Theme use={['background']} tag="div">
      {children}
    </Theme>
  </ThemeProvider>
);

const ConditionPreview: React.FC<{ cf: CollectionFilterType }> = ({ cf }) => {
  const operator = `"${cf.operator}"`;
  if (isSingleValueCollectionFilter(cf)) {
    return <span>{`${operator}, "${cf.value}"`}</span>;
  }
  if (isMultiValueCollectionFilter(cf)) {
    return <span>{`${operator}, ${JSON.stringify(cf.values)}`}</span>;
  }
  return null;
};

const Preview: React.FC<{ path: string; cf: CollectionFilterType }> = ({
  path,
  cf,
}) => {
  const collectionId = path.split('/').pop();
  return (
    <code className={styles.preview} aria-label="Code preview">
      <div>.collection({`${JSON.stringify(collectionId)}`})</div>
      {(isSingleValueCollectionFilter(cf) ||
        isMultiValueCollectionFilter(cf)) && (
        <div className={styles.previewFilter}>
          .where("{cf.field}", <ConditionPreview cf={cf} />)
        </div>
      )}
      {isSortableCollectionFilter(cf) && !!cf.sort && (
        <div className={styles.previewFilter}>
          .orderBy({`"${cf.field}", "${cf.sort}"`})
        </div>
      )}
    </code>
  );
};

const ConditionSelect: React.FC = ({ children }) => {
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
        onChange={([selected]) => selected.currentTarget.value || undefined}
      />
      {children}
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
  }, [append, fields]);

  return (
    <ul className={styles.conditionEntries}>
      {fields.map((field, index) => (
        <li key={field.id}>
          <ConditionEntry name={`${name}[${index}]`} />
          <IconButton
            className={fields.length > 1 ? styles.removeFilter : styles.hidden}
            icon="delete"
            label="Remove filter"
            type="button"
            onClick={() => remove(index)}
          />
        </li>
      ))}
      <Button type="button" icon="add" onClick={() => append({ _: '' })}>
        Add value
      </Button>
    </ul>
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
  }, [register, unregister, disabled, name, setValue]);

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
  const { setValue, watch } = useFormContext();
  const value = watch(name);
  const [fieldType, setFieldType] = useState(getConditionEntryType(value));

  const numberRegex = /^-?([\d]*\.?[\d+]|Infinity|NaN)$/;

  useEffect(() => {
    // Essentially setting the defaultValue of this form-field,
    // specifically when chaning types between Single <--> Multi
    if (value === undefined) {
      setValue(name, '');
    }
  }, [value, setValue, name]);

  return (
    <div className={styles.conditionEntry}>
      <SelectField
        fieldClassName={styles.conditionEntryType}
        options={['string', 'number', 'boolean']}
        value={fieldType}
        onChange={evt => {
          setFieldType(evt.currentTarget.value);
        }}
      />

      {fieldType === 'string' && (
        <Controller
          as={Field}
          name={name}
          defaultValue=""
          error={error}
          aria-label="Value"
        />
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
          aria-label="Value"
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
  }, [register, unregister, setValue, name]);

  const selectValue = watch(name);

  return (
    <SelectField
      name={name}
      options={['true', 'false']}
      value={selectValue}
      onChange={evt => setValue(name, evt.currentTarget.value === 'true')}
      aria-label="Value"
    />
  );
};

// Accordian-view for expanding/collapsing panels in the query-view
const FilterItem: React.FC<{
  title: string;
  preview?: React.ReactNode;
  defaultOpen: boolean;
}> = ({ title, preview, defaultOpen, children }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <CollapsibleList
      className={styles.listItem}
      defaultOpen={expanded}
      handle={
        <SimpleListItem
          text={
            <div className={styles.headerTitle}>
              <Typography use="body1">{title}</Typography>
              {!expanded && preview && (
                <Typography use="caption">{preview}</Typography>
              )}
            </div>
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
