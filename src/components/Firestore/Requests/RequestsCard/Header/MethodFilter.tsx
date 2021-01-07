/**
 * Copyright 2019 Google LLC
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

import './MethodFilter.scss';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { SelectField } from '../../../../common/Field';

const OutcomeFilter: React.FC = () => {
  const methods = useForm();
  const { control } = methods;
  const options: Array<{
    label: string;
    value: string;
  }> = [
    {
      label: 'GET',
      value: 'get',
    },
    {
      label: 'LIST',
      value: 'list',
    },
    {
      label: 'CREATE',
      value: 'create',
    },
    {
      label: 'UPDATE',
      value: 'update',
    },
    {
      label: 'DELETE',
      value: 'delete',
    },
  ];

  return (
    <div className="Firestore-Requests-Header-Method-Filter">
      <Controller
        as={SelectField}
        control={control}
        name="method filter"
        placeholder="All methods"
        options={options}
        onChange={([selected]) => selected.currentTarget.value || undefined}
      />
    </div>
  );
};

export default OutcomeFilter;
