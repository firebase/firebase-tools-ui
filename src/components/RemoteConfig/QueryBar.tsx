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
 
import { TextField } from '@rmwc/textfield';
import type {
  RemoteConfigParameter,
  RemoteConfigParameterValue,
} from 'firebase-admin/remote-config';
import { useLayoutEffect, useRef } from 'react';

import { remoteConfigParameterValueToString } from './api';
import styles from './RemoteConfig.module.scss';

/**
 * returns whether a parameter contains a search term in its name, condition names, or condition values
 *
 * @param searchTerm the search string
 * @param paramName the name of the RC parameter
 * @param param the RC parameter to search through
 * @returns whether or not the search term was found
 */
export function paramContainsSearchTerm(
  searchTerm: string,
  paramName: string,
  param: RemoteConfigParameter
): boolean {
  function matchesSearch(str: string) {
    return str.toLowerCase().includes(searchTerm.toLowerCase());
  }

  if (matchesSearch(paramName)) {
    return true;
  }

  if (
    matchesSearch(
      remoteConfigParameterValueToString(
        param.defaultValue as RemoteConfigParameterValue
      )
    )
  ) {
    return true;
  }

  for (let conditionName in param.conditionalValues) {
    if (matchesSearch(conditionName)) {
      return true;
    }

    if (
      matchesSearch(
        remoteConfigParameterValueToString(
          param.conditionalValues[conditionName] as RemoteConfigParameterValue
        )
      )
    ) {
      return true;
    }
  }
  return false;
}

export const QueryBar: React.FunctionComponent<{
  filter: string;
  setFilter: (newFilter: string) => void;
}> = ({ filter, setFilter }) => {
  const filterEl = useRef<HTMLInputElement>(null);

  function clear() {
    setFilter('');
  }

  // Focus on init and also on clear.
  useLayoutEffect(() => {
    if (filter === '') {
      filterEl.current?.focus();
    }
  }, [filter]);

  return (
    <form
      className={styles.filterForm}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextField
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFilter(event.target.value);
        }}
        placeholder="Search parameters"
        value={filter}
        aria-label="filter"
        fullwidth
        type="text"
        inputRef={filterEl}
        outlined={false}
        ripple={false}
        icon="search"
        trailingIcon={
          filter && {
            icon: 'close',
            role: 'button',
            'aria-label': 'clear',
            onClick: clear,
          }
        }
      />
    </form>
  );
};
