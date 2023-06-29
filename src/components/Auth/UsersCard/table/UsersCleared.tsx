/**
 * Copyright 2023 Google LLC
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

/**
 *
 * Renders a visibly hidden, but screenreader parseable, alert to
 * inform the user that all users have been deleted after the
 * `Clear All Data` button is pressed. The text rendered /
 * spoken in the component is housed in the auth redux store's
 * `alertText` field. Changing the value stored in this field triggers
 * a re-render of this component, which will force a screenreader to
 * read the new text. Thus, the value stored in `alertText` should only
 * be 1. updated when you want the screen reader to alert the user of something,
 * or 2. cleared to allow the screenreader to repeat a message (the text in
 * `alertText` is only read by the screenreader when the value is updated).
 *
 * Examples of such updates / clears are available in src/store/auth/reducer.tsx
 *
 */
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
