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

import React from 'react';
import { Icon } from '@rmwc/icon';

export const FirestoreLogo: React.FC = () => {
  return (
    <Icon
      icon={{
        strategy: 'component',
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 13l-9 4v-4l9-4 9 4v3.5-.75V17l-9-4zm0-11l9 4v4l-9-4-9 4V6l9-4zm3.375 14.5l4.5 2L12 22v-4l3.375-1.5z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        ),
      }}
    />
  );
};

export default FirestoreLogo;
