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

import { Icon, IconProps } from '@rmwc/icon';
import { ComponentProps } from '@rmwc/types';
import React from 'react';

// Firebase products from https://firebase.google.com/brand-guidelines?hl=en
// To adapt those icons and make them work nicely, follow steps below:
// 1. Copy and paste full SVG source code (including the <svg> element).
//    Prefer files with suffix "(7- Raw Icon, Dark).svg".
// 2. Remove width and height from <svg> and add viewBox="0 0 192 192" to make
//    the icon resizable. (Replace 192 with actual width and height values.)
// 3. Change fill="#000" etc. to fill="currentColor" everywhere for theming.
// 4. Change kabab-case-attrs to snakeCaseAttrs to keep React happy.

export const FirestoreIcon = svgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
    <g fill="none">
      <path d="M0 0h192v192H0z" />
      <path
        d="M96 104l-72 32v-32l72-32 72 32v28-6 10zm0-88l72 32v32L96 48 24 80V48zm27 116l36 16-63 28v-32z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

export const DatabaseIcon = svgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
    <g fill="none">
      <path d="M0 0h192v192H0z" />
      <path
        d="M24 120h144v32.016c0 8.832-7.144 15.984-15.96 15.984H39.96C31.144 168 24 160.816 24 152.016zm0-80.064C24 31.136 31.144 24 39.96 24h112.08c8.816 0 15.96 7.2 15.96 15.936v56.128c0 8.8-7.144 15.936-15.96 15.936H39.96C31.144 112 24 104.8 24 96.064zM40 40h112v24H40zm0 44.04C40 81.8 41.712 80 44.04 80h7.92C54.2 80 56 81.712 56 84.04v7.92C56 94.2 54.288 96 51.96 96h-7.92C41.8 96 40 94.288 40 91.96zm0 56c0-2.24 1.712-4.04 4.04-4.04h7.92c2.24 0 4.04 1.712 4.04 4.04v7.92c0 2.24-1.712 4.04-4.04 4.04h-7.92c-2.24 0-4.04-1.712-4.04-4.04z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

export const FunctionsIcon = svgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
    <g fill="none">
      <path d="M0 0h192v192H0z" />
      <path
        d="M160.056 134.048v-76.08l-26.944-26.944 16.952-16.96L184 48v86.16l-.056.032v9.832l-33.904 33.912L133.112 161zm-128.112-.024l26.944 26.952-16.952 16.96L8 144V57.84l.056-.032v-9.832L41.96 14.064 58.888 31 31.944 57.952v76.08zm28.064-26c-6.647 0-12.036-5.389-12.036-12.036 0-6.647 5.389-12.036 12.036-12.036 6.645 0 12.032 5.387 12.032 12.032 0 6.645-5.387 12.032-12.032 12.032zm35.984 0c-6.647 0-12.036-5.389-12.036-12.036 0-6.647 5.389-12.036 12.036-12.036 6.645 0 12.032 5.387 12.032 12.032 0 6.645-5.387 12.032-12.032 12.032zm35.984 0c-6.647 0-12.036-5.389-12.036-12.036 0-6.647 5.389-12.036 12.036-12.036 6.645 0 12.032 5.387 12.032 12.032 0 6.645-5.387 12.032-12.032 12.032z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

// Other icons below:

// TODO: Re-implement outer circle using CSS and dedupe with DatabaseIcon.
export const DatabaseCircleIcon = svgIcon(
  <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 37C28.9411 37 37 28.9411 37 19C37 9.05887 28.9411 1 19 1C9.05887 1 1 9.05887 1 19C1 28.9411 9.05887 37 19 37Z"
      fill="white"
      stroke="black"
      strokeOpacity="0.12"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 22H28V26.002C28.0005 26.5315 27.7906 27.0396 27.4164 27.4143C27.0423 27.7891 26.5345 27.9997 26.005 28H11.995C10.8929 27.9978 10.0005 27.1041 10 26.002V22ZM10 11.992C10 10.892 10.893 10 11.995 10H26.005C27.107 10 28 10.9 28 11.992V19.008C28 20.108 27.107 21 26.005 21H11.995C10.893 21 10 20.1 10 19.008V11.992ZM12 12H26V15H12V12ZM12 17.505C12 17.225 12.214 17 12.505 17H13.495C13.775 17 14 17.214 14 17.505V18.495C14 18.775 13.786 19 13.495 19H12.505C12.3704 19.0022 12.2407 18.9497 12.1455 18.8545C12.0503 18.7593 11.9978 18.6296 12 18.495V17.505ZM12 24.505C12 24.225 12.214 24 12.505 24H13.495C13.775 24 14 24.214 14 24.505V25.495C14 25.775 13.786 26 13.495 26H12.505C12.3704 26.0022 12.2407 25.9497 12.1455 25.8545C12.0503 25.7593 11.9978 25.6296 12 25.495V24.505Z"
      fill="currentColor"
    />
  </svg>
);

export const HintIcon = svgIcon(
  <svg viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.99998 13C2.99998 13.3667 3.29998 13.6667 3.66665 13.6667H6.33331C6.69998 13.6667 6.99998 13.3667 6.99998 13V12.3334H2.99998V13ZM4.99998 0.333374C2.42665 0.333374 0.333313 2.42671 0.333313 5.00004C0.333313 6.58671 1.12665 7.98004 2.33331 8.82671V10.3334C2.33331 10.7 2.63331 11 2.99998 11H6.99998C7.36665 11 7.66665 10.7 7.66665 10.3334V8.82671C8.87331 7.98004 9.66665 6.58671 9.66665 5.00004C9.66665 2.42671 7.57331 0.333374 4.99998 0.333374ZM6.89998 7.73337L6.33331 8.13337V9.66671H3.66665V8.13337L3.09998 7.73337C2.65831 7.42718 2.29727 7.01867 2.04768 6.54271C1.79809 6.06675 1.66736 5.53747 1.66665 5.00004C1.66665 3.16004 3.15998 1.66671 4.99998 1.66671C6.83998 1.66671 8.33331 3.16004 8.33331 5.00004C8.33331 6.08671 7.79998 7.10671 6.89998 7.73337Z"
      fill="currentColor"
    />
  </svg>
);

function svgIcon(
  svgElement: JSX.Element
): React.FC<
  { size?: string } & ComponentProps<Omit<IconProps, 'size'>, {}, 'svg'>
> {
  return ({ size = 'small', ...props }) => {
    return (
      <Icon
        icon={{
          strategy: 'component',
          size,
          icon: svgElement,
        }}
        {...props}
      />
    );
  };
}
