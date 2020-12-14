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

import { CardActionButton, CardActionButtons, CardActions } from '@rmwc/card';
import { CollapsibleList, SimpleListItem } from '@rmwc/list';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import firebase from 'firebase';
import React, { useState } from 'react';
import { Controller, FormContext, useForm } from 'react-hook-form';

import { grey100 } from '../../../colors';
import { Field, SelectField } from '../../../components/common/Field';
import * as actions from '../actions';
import {
  CollectionFilter as CollectionFilterType,
  isMultiValueCollectionFilter,
  isSingleValueCollectionFilter,
  isSortableCollectionFilter,
} from '../models';
import { useCollectionFilter, useDispatch } from '../store';
import styles from './CollectionFilter.module.scss';
import { ConditionEntries } from './ConditionEntries';
import { ConditionEntry } from './ConditionEntry';
import { SortRadioGroup } from './SortRadioGroup';

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
              rules={{ required: 'Required' }}
              defaultValue=""
              error={
                (formMethods.formState.touched as any)['field'] &&
                (formMethods.errors as any)['field']?.message
              }
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
                <ConditionEntry
                  name="value"
                  error={
                    (formMethods.formState.touched as any)['value'] &&
                    (formMethods.errors as any)['value']?.message
                  }
                />
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
  const options: Array<{
    label: string;
    value: firebase.firestore.WhereFilterOp;
  }> = [
    {
      label: '(==) equal to',
      value: '==',
    },
    {
      label: '(!=) not equal to',
      value: '!=',
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
      label: '(not-in) not equal to any of the following',
      value: 'not-in',
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
