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

import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import React from 'react';

import styles from './AdvancedEditCard.module.scss';

export const AdvancedEditCard: React.FC<{}> = () => {
  return (
    <Card className={styles.wrapper}>
      <div>
        <Typography use="headline6" tag="div" theme="textPrimaryOnBackground">
          Need to make more advanced edits?
        </Typography>
        <Typography use="body2" theme="textPrimaryOnBackground">
          <p>
            Edit your local <code>remoteconfig.template.json</code> file in your
            favorite code editor to make more in-depth changes to your Remote
            Config template, such as modifying in-app default values.
          </p>
        </Typography>
        <Typography use="body2" theme="textPrimaryOnBackground">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://firebase.google.com/docs/remote-config/templates"
          >
            Learn more about Remote Config templates
          </a>
        </Typography>
      </div>
    </Card>
  );
};
