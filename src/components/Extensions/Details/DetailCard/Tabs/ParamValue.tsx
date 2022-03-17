import { IconButton } from '@rmwc/icon-button';
import { Theme } from '@rmwc/theme';
import { useState } from 'react';

/**
 * Copyright 2022 Google LLC
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
import { ParamType } from '../../../models';
import styles from './ParamList.module.scss';

interface ParamValueProps {
  value: string;
  type?: ParamType;
}

export const ParamValue: React.FC<ParamValueProps> = ({ value, type }) => {
  const [showValue, setShowValue] = useState(false);

  if (type !== ParamType.SECRET) {
    return <div>{value}</div>;
  }

  return showValue ? (
    <div className={styles.paramValue}>
      <Theme use="secondary">
        <IconButton
          onClick={() => setShowValue(false)}
          icon={{ icon: 'visibility_off' }}
          aria-label="Hide value"
        />
      </Theme>
      <div>{value}</div>
    </div>
  ) : (
    <div className={styles.paramValue}>
      <Theme use="secondary">
        <IconButton
          onClick={() => setShowValue(true)}
          icon={{ icon: 'visibility' }}
          theme="secondary"
          aria-label="Show value"
        />
      </Theme>
      <div>***</div>
    </div>
  );
};
