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

import { primary } from './colors';

/** Error color used in global theme */
export const error = '#d32f2f'; // Red 700

const purple50 = '#f3e5f5';
export const tipTheme = {
  background: purple50,
  primary,
  primaryRgb: '104, 29, 168',
  textIconOnBackground: primary,
  textPrimaryOnBackground: primary,
  textSecondaryOnBackground: `rgba(${primary}, 0.7)`,
};

const teal50 = '#e0f2f1';
const teal700 = '#00796b';
const teal800 = '#00695c';
export const successTheme = {
  background: teal50,
  primary: teal700,
  primaryRgb: '0, 121, 107',
  textIconOnBackground: teal700,
  textPrimaryOnBackground: teal800,
  textSecondaryOnBackground: `rgba(${teal800}, 0.7)`,
};

const navy20 = '#e5eaf0';
const navy300 = '#476282';
const navy600 = '#1b3a57';
export const noteTheme = {
  background: navy20,
  primary: navy300,
  primaryRgb: '71, 98, 130',
  textIconOnBackground: navy300,
  textPrimaryOnBackground: navy600,
  textSecondaryOnBackground: `rgba(${navy600}, 0.7)`,
};

const orange50 = '#fff3e0';
const amber800 = '#ff8f00';
const deepOrange900 = '#bf360c';
export const cautionTheme = {
  background: orange50,
  primary: amber800,
  primaryRgb: '255, 143, 0',
  onPrimary: 'white',
  textIconOnBackground: amber800,
  textPrimaryOnBackground: deepOrange900,
  textSecondaryOnBackground: `rgba(${deepOrange900}, 0.7)`,
};

const deepOrange50 = '#fbe9e7';
const red700 = '#d32f2f';
const red800 = '#c62828';
export const errorTheme = {
  background: deepOrange50,
  primary: red700,
  primaryRgb: '211, 47, 47',
  textIconOnBackground: red700,
  textPrimaryOnBackground: red800,
  textSecondaryOnBackground: `rgba(${red800}, 0.7)`,
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

export const CustomThemeProvider: React.FC<Props> = ({
  use,
  wrap,
  children,
}) => (
  <ThemeProvider options={THEME_MAP[use]} wrap={wrap}>
    {children}
  </ThemeProvider>
);
