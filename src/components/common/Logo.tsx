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

import { Icon } from '@rmwc/icon';
import React from 'react';

export const Logo: React.FC<React.PropsWithChildren<unknown>> = () => (
  <Icon
    className="Logo"
    icon={{
      strategy: 'component',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 192 192"
          style={{ width: '24px', height: '24px' }}
        >
          <defs>
            <clipPath id="a">
              <path d="M143.41 47.34a4 4 0 0 0-6.77-2.16L115.88 66 99.54 34.89a4 4 0 0 0-7.08 0l-8.93 17-22.4-41.77a4 4 0 0 0-7.48 1.28L32 150l57.9 32.46a12 12 0 0 0 11.7 0L160 150z" />
            </clipPath>
            <linearGradient
              id="d"
              x1="-108.63"
              y1="-692.24"
              x2="-58.56"
              y2="-742.31"
              gradientTransform="matrix(2.67 0 0 -2.67 317.23 -1808)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity=".1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="b"
              x1="56.9"
              y1="102.54"
              x2="48.9"
              y2="98.36"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#a52714" />
              <stop offset=".4" stopColor="#a52714" stopOpacity=".5" />
              <stop offset=".8" stopColor="#a52714" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="c"
              x1="90.89"
              y1="90.91"
              x2="87.31"
              y2="87.33"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#a52714" stopOpacity=".8" />
              <stop offset=".5" stopColor="#a52714" stopOpacity=".21" />
              <stop offset="1" stopColor="#a52714" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath="url(#a)">
            <path
              d="M32 150L53.66 11.39a4 4 0 0 1 7.48-1.27l22.4 41.78 8.93-17a4 4 0 0 1 7.08 0L160 150z"
              fill="#ffa000"
            />
            <path
              opacity=".12"
              fill="url(#b)"
              d="M106 9L0 0v192l32-42L106 9z"
            />
            <path
              d="M106.83 96.01l-23.3-44.12L32 150l74.83-53.99z"
              fill="#f57c00"
            />
            <path opacity=".2" fill="url(#c)" d="M0 0h192v192H0z" />
            <path
              d="M160 150L143.41 47.34a4 4 0 0 0-6.77-2.16L32 150l57.9 32.47a12 12 0 0 0 11.7 0z"
              fill="#ffca28"
            />
            <path
              d="M143.41 47.34a4 4 0 0 0-6.77-2.16L115.88 66 99.54 34.89a4 4 0 0 0-7.08 0l-8.93 17-22.4-41.77a4 4 0 0 0-7.48 1.28L32 150h-.08l.07.08.57.28L115.83 67l20.78-20.8a4 4 0 0 1 6.78 2.16l16.45 101.74.16-.1zM32.19 149.81L53.66 12.39a4 4 0 0 1 7.48-1.28l22.4 41.78 8.93-17a4 4 0 0 1 7.08 0l16 30.43z"
              fill="#fff"
              fillOpacity=".2"
            />
            <path
              d="M101.6 181.49a12 12 0 0 1-11.7 0l-57.76-32.4-.14.91 57.9 32.46a12 12 0 0 0 11.7 0L160 150l-.15-.92z"
              // style="isolation:isolate"
              fill="#a52714"
              opacity=".2"
            />
            <path
              d="M143.41 47.34a4 4 0 0 0-6.77-2.16L115.88 66 99.54 34.89a4 4 0 0 0-7.08 0l-8.93 17-22.4-41.77a4 4 0 0 0-7.48 1.28L32 150l57.9 32.46a12 12 0 0 0 11.7 0L160 150z"
              fill="url(#d)"
            />
          </g>
        </svg>
      ),
    }}
  />
);

export default Logo;
