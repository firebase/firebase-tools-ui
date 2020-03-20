import './Callout.scss';

import { Icon } from '@rmwc/icon';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { ReactNode } from 'react';

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
  NOTE = 'note',
  SUCCESS = 'success',
  TIP = 'tip',
  WARNING = 'warning',
  CAUTION = 'caution',
}

const DEFAULT_ICON_MAP: Record<string, string> = {
  [Type.NOTE]: 'info',
  [Type.SUCCESS]: 'check_circle',
  [Type.TIP]: 'star',
  [Type.WARNING]: 'warning',
  [Type.CAUTION]: 'error',
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
    <Theme
      className={classes}
      use={aside ? ['primary'] : ['onPrimary', 'primaryBg']}
      tag="div"
    >
      <div className="Callout-body">
        <div className="Callout-message">
          {iconName && (
            <Icon icon={iconName} aria-hidden="true" className="Callout-icon" />
          )}
          <Typography use="subtitle2">{children}</Typography>
        </div>
      </div>
      {/* Make "white" the new primary, just to invert buttons from props */}
      <ThemeProvider wrap options={aside ? {} : { primary: '#fff' }}>
        <div className="Callout-actions">{actions}</div>
      </ThemeProvider>
    </Theme>
  );
};
