import './Callout.scss';

import { Icon } from '@rmwc/icon';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { ReactNode } from 'react';

import { CustomThemeProvider, CustomThemeType, Type } from '../../themes';

export interface CalloutProps {
  /** Custom icon to override the default */
  icon?: string;
  /** Show a lighter version of the callout */
  aside?: true;
  /** The color scheme of the callout. Defaults to 'note' */
  type?: CustomThemeType;

  /** Action buttons */
  actions?: ReactNode;
}

const DEFAULT_ICON_MAP: Record<string, string> = {
  [Type.CAUTION]: 'error',
  [Type.NOTE]: 'info',
  [Type.SUCCESS]: 'check_circle',
  [Type.TIP]: 'star',
  [Type.WARNING]: 'warning',
};

export const Callout: React.FC<CalloutProps> = ({
  children,
  actions,
  icon,
  aside,
  type = Type.NOTE,
}) => {
  const iconName = icon || DEFAULT_ICON_MAP[type];
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
                aria-hidden="true"
                className="Callout-icon"
              />
            )}
            <Typography use="subtitle2">{children}</Typography>
          </div>
        </div>
        {/* Make "white" the new primary, just to invert buttons from props */}
        <ThemeProvider wrap options={aside ? {} : { primary: '#fff' }}>
          <div className="Callout-actions">{actions}</div>
        </ThemeProvider>
      </Theme>
    </CustomThemeProvider>
  );
};
