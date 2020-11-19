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

import './RulesTable.scss';

import { ThemeProvider } from '@rmwc/theme';
import React from 'react';

import { grey100 } from '../../colors';
import { CustomThemeProvider } from '../../themes';

export const RulesTable: React.FC<{}> = ({}) => {
  return (
    <ThemeProvider
      options={{
        surface: grey100,
      }}
    >
      <div className="Firestore-RulesTable">
        <table className="Firestore-rules-table">
          <thead>
            <tr>
              <th>Resource name</th>
              <th>Outcome</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>source/path1</td>
              <CustomThemeProvider use="warning" wrap>
                <td className="Firestore-RulesTable-Outcome">DENY</td>
              </CustomThemeProvider>
              <td>2:31:56 PM</td>
            </tr>
            <tr>
              <td>source/path2</td>
              <CustomThemeProvider use="success" wrap>
                <td className="Firestore-RulesTable-Outcome">ALLOW</td>
              </CustomThemeProvider>
              <td>2:32:56 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ThemeProvider>
  );
};

export default RulesTable;
