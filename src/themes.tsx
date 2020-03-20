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
  textIconOnBackground: red700,
  textPrimaryOnBackground: red800,
  textSecondaryOnBackground: `rgba(${red800}, 0.7)`,
};

export const SuccessTheme: React.FC<{ wrap?: boolean }> = ({
  wrap,
  children,
}) => (
  <ThemeProvider options={successTheme} wrap={wrap}>
    {children}
  </ThemeProvider>
);

export const NoteTheme: React.FC<{ wrap?: boolean }> = ({ wrap, children }) => (
  <ThemeProvider options={noteTheme} wrap={wrap}>
    {children}
  </ThemeProvider>
);

export const CautionTheme: React.FC<{ wrap?: boolean }> = ({
  wrap,
  children,
}) => (
  <ThemeProvider options={cautionTheme} wrap={wrap}>
    {children}
  </ThemeProvider>
);

export const ErrorTheme: React.FC<{ wrap?: boolean }> = ({
  wrap,
  children,
}) => (
  <ThemeProvider options={errorTheme} wrap={wrap}>
    {children}
  </ThemeProvider>
);
