import './Callout.scss';

import { Icon } from '@rmwc/icon';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { ReactNode } from 'react';

import {
  cautionTheme,
  errorTheme,
  noteTheme,
  successTheme,
  tipTheme,
} from '../../themes';

export interface CalloutProps {
  /** Custom icon to override the default */
  icon?: string;
  /** Show a lighter version of the callout */
  aside?: true;
  /** The color scheme of the callout */
  type?: 'note' | 'success' | 'warning' | 'caution' | 'tip';

  /** Action buttons */
  actions?: ReactNode;
}

// TODO: Fill in tip (based on)
export enum Type {
  CAUTION = 'caution',
  NOTE = 'note',
  SUCCESS = 'success',
  TIP = 'tip',
  WARNING = 'warning',
}

const DEFAULT_ICON_MAP: Record<string, string> = {
  [Type.CAUTION]: 'error',
  [Type.NOTE]: 'info',
  [Type.SUCCESS]: 'check_circle',
  [Type.TIP]: 'star',
  [Type.WARNING]: 'warning',
};

const THEME_MAP: Record<string, Record<string, string>> = {
  [Type.CAUTION]: cautionTheme,
  [Type.NOTE]: noteTheme,
  [Type.SUCCESS]: successTheme,
  [Type.TIP]: tipTheme,
  [Type.WARNING]: errorTheme,
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
    <ThemeProvider options={THEME_MAP[type]} wrap>
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
    </ThemeProvider>
  );
};
