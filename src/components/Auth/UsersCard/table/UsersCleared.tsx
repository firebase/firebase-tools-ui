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

import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAlertText } from '../../../../store/auth/selectors';
import styles from './UsersCleared.module.scss';

export type UsersClearedProps = PropsFromStore;

export const UsersCleared: React.FC<
  React.PropsWithChildren<UsersClearedProps>
> = ({ alertText }) => {
  return (
    <div className={styles.visuallyHidden} role="alert">
      {alertText}
    </div>
  );
};

export const mapStateToProps = createStructuredSelector({
  alertText: getAlertText,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(UsersCleared);
