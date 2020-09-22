import { TextField } from '@rmwc/textfield';
import keycode from 'keycode';
import React, { useLayoutEffect, useRef } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { updateFilter } from '../../../../store/auth/actions';
import { getFilter } from '../../../../store/auth/selectors';
import styles from './AuthFilter.module.scss';

export const AuthFilter: React.FC<AuthFilterProps> = ({
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
        onSubmit={e => {
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
> = dispatch => ({
  updateFilter: f => dispatch(updateFilter(f)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthFilter);
