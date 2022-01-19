/**
 * Copyright 2021 Google LLC
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

import { Select } from '@rmwc/select';
import React, { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { createStructuredSelector } from '../../../store';
import { getTenants } from '../../../store/auth/selectors';
import { MultiTenancyIcon } from '../../common/icons';
import styles from './UsersCard.module.scss';
import { authPath } from '..';

export function useTenantFromUrl(): [string, (tenantId: string) => void] {
  const history = useHistory();
  const tenant = useParams<{ tenantId: string }>().tenantId;

  function setTenant(tenantId: string) {
    history.push(authPath + tenantId);
  }

  return [tenant, setTenant];
}

const TenantPicker: React.FC<PropsFromStore> = ({ tenants }) => {
  const [tenant, setTenant] = useTenantFromUrl();

  return (
    <Select
      icon={<MultiTenancyIcon />}
      className={styles.tenantPicker}
      value={tenant ?? 'Default Tenant'}
      aria-label="Select tenant"
      options={['Default Tenant', ...(tenants ? tenants : [])]}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        let selectedTenant: string = event.target.value;
        if (selectedTenant === 'Default Tenant') {
          selectedTenant = '';
        }
        setTenant(selectedTenant);
      }}
    />
  );
};

export const mapStateToProps = createStructuredSelector({
  tenants: getTenants,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(TenantPicker);
