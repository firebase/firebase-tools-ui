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

import { TextField } from '@rmwc/textfield';
import keycode from 'keycode';
import React, { useLayoutEffect, useRef } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { updateFilter } from '../../../../store/auth/actions';
import { getFilter } from '../../../../store/auth/selectors';
import styles from './AuthFilter.module.scss';

export const AuthFilter: React.FC<React.PropsWithChildren<AuthFilterProps>> = ({
  filter,
  updateFilter,
}) => {
  const clear = () => updateFilter({ filter: '' });
  const filterEl = useRef<HTMLInputElement>(null);

  // Focus on init and also on clear.
  useLayoutEffect(() => {
    if (filter === '') {
      filterEl.current?.focus();
    }
  }, [filter]);

  return (
    <>
      <form
        role="search"
        className={styles.filterForm}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <TextField
          onChange={(input: React.ChangeEvent<HTMLInputElement>) => {
            updateFilter({ filter: input.target.value });
          }}
          placeholder="Search by user UID, email address, phone number, or display name"
          value={filter}
          aria-label="filter"
          fullwidth
          type="text"
          inputRef={filterEl}
          outlined={false}
          ripple={false}
          icon="search"
          className={styles.filterTextField}
          trailingIcon={
            filter && {
              icon: 'close',
              role: 'button',
              'aria-label': 'clear',
              onClick: clear,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (
                  e.keyCode === keycode('spacebar') ||
                  e.keyCode === keycode('enter')
                ) {
                  clear();
                  e.preventDefault();
                }
              },
            }
          }
        />
      </form>
    </>
  );
};

export interface PropsFromStore {
  filter: string;
}

export type AuthFilterProps = PropsFromStore & PropsFromDispatch;

export const mapStateToProps = createStructuredSelector({
  filter: getFilter,
});

export interface PropsFromDispatch {
  updateFilter: typeof updateFilter;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => ({
  updateFilter: (f) => dispatch(updateFilter(f)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthFilter);
