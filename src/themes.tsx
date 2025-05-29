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

import { ThemeProvider } from '@rmwc/theme';
import React from 'react';

export const tipTheme = {
  background: 'var(--tip-background)',
  primary: 'var(--tip-primary)',
  primaryRgb: 'var(--tip-primary-rgb)',
  textIconOnBackground: 'var(--tip-text-icon-on-background)',
  textPrimaryOnBackground: 'var(--tip-text-primary-on-background)',
  textSecondaryOnBackground: 'var(--tip-text-secondary-on-background)',
};

export const successTheme = {
  background: 'var(--success-background)',
  primary: 'var(--success-primary)',
  primaryRgb: 'var(--success-primary-rgb)',
  textIconOnBackground: 'var(--success-text-icon-on-background)',
  textPrimaryOnBackground: 'var(--success-text-primary-on-background)',
  textSecondaryOnBackground: 'var(--success-text-secondary-on-background)',
};

export const noteTheme = {
  background: 'var(--note-background)',
  primary: 'var(--note-primary)',
  primaryRgb: 'var(--note-primary-rgb)',
  textIconOnBackground: 'var(--note-text-icon-on-background)',
  textPrimaryOnBackground: 'var(--note-text-primary-on-background)',
  textSecondaryOnBackground: 'var(--note-text-secondary-on-background)',
};

export const cautionTheme = {
  background: 'var(--caution-background)',
  primary: 'var(--caution-primary)',
  primaryRgb: 'var(--caution-primary-rgb)',
  onPrimary: 'var(--caution-on-primary)',
  textIconOnBackground: 'var(--caution-text-icon-on-background)',
  textPrimaryOnBackground: 'var(--caution-text-primary-on-background)',
  textSecondaryOnBackground: 'var(--caution-text-secondary-on-background)',
};

export const errorTheme = {
  background: 'var(--error-background)',
  primary: 'var(--error-primary)',
  primaryRgb: 'var(--error-primary-rgb)',
  textIconOnBackground: 'var(--error-text-icon-on-background)',
  textPrimaryOnBackground: 'var(--error-text-primary-on-background)',
  textSecondaryOnBackground: 'var(--error-text-secondary-on-background)',
};

/** Possible theme types */
export enum Type {
  CAUTION = 'caution',
  NOTE = 'note',
  SUCCESS = 'success',
  TIP = 'tip',
  WARNING = 'warning',
}

const THEME_MAP: Record<string, Record<string, string>> = {
  [Type.CAUTION]: cautionTheme,
  [Type.NOTE]: noteTheme,
  [Type.SUCCESS]: successTheme,
  [Type.TIP]: tipTheme,
  [Type.WARNING]: errorTheme,
};

export type CustomThemeType =
  | 'caution'
  | 'note'
  | 'success'
  | 'tip'
  | 'warning';

interface Props {
  use: CustomThemeType;
  wrap?: boolean;
}

export const CustomThemeProvider: React.FC<React.PropsWithChildren<Props>> = ({
  use,
  wrap,
  children,
}) => (
  <ThemeProvider options={THEME_MAP[use]} wrap={wrap}>
    {children}
  </ThemeProvider>
);
