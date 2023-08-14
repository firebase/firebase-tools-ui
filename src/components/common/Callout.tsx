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

import './Callout.scss';

import { Icon } from '@rmwc/icon';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { ReactNode } from 'react';

import { CustomThemeProvider, CustomThemeType, Type } from '../../themes';

export interface CalloutProps {
  /** Show a lighter version of the callout */
  aside?: true;
  /** The color scheme of the callout. Defaults to 'note' */
  type?: CustomThemeType;
  /** Action buttons */
  actions?: ReactNode;
}

// Using a type from the map ensures we can apply the correct aria label in
// addition to providing easy-to-use defailts.
const DEFAULT_ICON_MAP: Record<string, string> = {
  [Type.CAUTION]: 'error',
  [Type.NOTE]: 'info',
  [Type.SUCCESS]: 'check_circle',
  [Type.TIP]: 'star',
  [Type.WARNING]: 'warning',
};

export const Callout: React.FC<React.PropsWithChildren<CalloutProps>> = ({
  children,
  aside,
  type = Type.NOTE,
  actions,
}) => {
  const iconName = DEFAULT_ICON_MAP[type];
  const asideClass = aside ? ' Callout-aside' : '';
  const classes = `Callout Callout-${type}${asideClass}`;

  return (
    <CustomThemeProvider use={type} wrap>
      <Theme
        className={classes}
        use={aside ? [] : ['onPrimary', 'primaryBg']}
        tag="div"
      >
        <div className="Callout-body">
          <div className="Callout-message">
            {iconName && (
              <Icon
                icon={iconName}
                aria-label={iconName + " icon"}
                className="Callout-icon"
              />
            )}
            <Typography
              use="subtitle2"
              tag="div"
              className="Callout-header-wrapper"
            >
              {children}
            </Typography>
          </div>
        </div>
        {/* Make "white" the new primary, just to invert buttons from props */}
        {actions && (
          <ThemeProvider wrap options={aside ? {} : { primary: '#fff' }}>
            <div className="Callout-actions">{actions}</div>
          </ThemeProvider>
        )}
      </Theme>
    </CustomThemeProvider>
  );
};
