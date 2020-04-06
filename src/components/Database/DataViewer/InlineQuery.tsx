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

import './InlineQuery.scss';

import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActions,
} from '@rmwc/card';
import keycode from 'keycode';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { Field, SelectField } from '../../common/Field';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_QUERY_PARAMS,
  QueryParams,
  jsonIshValue,
} from './common/view_model';

export interface Props {
  params?: QueryParams;
  onSubmit: (params: QueryParams) => void;
  onCancel: () => void;
}

type FormData = { [K in keyof QueryParams]: string };

export const InlineQuery = React.memo<Props>(function InlineQuery$({
  params = {},
  onSubmit,
  onCancel,
}) {
  const {
    key = '',
    operator = '==',
    value = '',
    limit = DEFAULT_PAGE_SIZE,
  } = params;

  const [form, setValues] = useState<FormData>({
    key,
    operator,
    value: JSON.stringify(value),
    limit: `${limit}`,
  });

  const updateField = (
    e: React.FormEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    setValues({
      ...form,
      [target.name]: target.value,
    });
  };

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit && onSubmit(toParams(form));
  };

  const cancelOnEscape = (e: React.KeyboardEvent) => {
    if (e.keyCode === keycode('esc')) {
      onCancel && onCancel();
    }
  };

  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (key) {
      valueInputRef.current!.focus();
      valueInputRef.current!.select();
    } else {
      keyInputRef.current!.focus();
      keyInputRef.current!.select();
    }
  }, [key]);

  return (
    <Card
      className="InlineQuery InlineQuery__card"
      tag="form"
      onSubmit={submitForm}
      onKeyDown={cancelOnEscape}
    >
      <div className="InlineQuery__form-fields">
        <Field
          outlined
          label="Key"
          name="key"
          value={form.key}
          onChange={updateField}
          inputRef={keyInputRef}
        />
        <SelectField
          label="Condition"
          name="operator"
          options={['==', '>=', '<=']}
          value={form.operator}
          onChange={updateField}
        />
        <Field
          label="Value"
          name="value"
          value={form.value}
          onChange={updateField}
          inputRef={valueInputRef}
          placeholder="JSON or plain text"
        />
        <Field
          label="limit"
          name="limit"
          value={form.limit}
          onChange={updateField}
        />
      </div>
      <CardActions className="InlineQuery__actions">
        <CardActionButtons>
          {params !== DEFAULT_QUERY_PARAMS && (
            <CardActionButton
              type="button"
              label="Reset"
              danger
              onClick={() => onSubmit(DEFAULT_QUERY_PARAMS)}
            />
          )}
          <CardActionButton
            theme="secondary"
            type="button"
            label="Cancel"
            onClick={() => onCancel && onCancel()}
          />
          <CardActionButton unelevated type="submit" label="Search" />
        </CardActionButtons>
      </CardActions>
    </Card>
  );
});

function toParams(form: FormData): QueryParams {
  const { key, operator, value, limit } = form;
  return {
    key,
    operator: operator as QueryParams['operator'],
    value: jsonIshValue(value || 'null'),
    limit: Number(limit),
  };
}
