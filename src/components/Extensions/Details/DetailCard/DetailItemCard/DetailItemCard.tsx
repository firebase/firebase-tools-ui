/**
 * Copyright 2022 Google LLC
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

import styles from './DetailItemCard.module.scss';

export interface DetailItemCardProps {
  header: JSX.Element;
  content: JSX.Element | string;
}

export const DetailItemCard: React.FC<DetailItemCardProps> = ({
  header,
  content,
}: DetailItemCardProps) => {
  return (
    <Card className={styles.card}>
      <header className={styles.header}>{header}</header>
      <div className={styles.content}>
        <Typography use="body2" theme="secondary">
          {content}
        </Typography>
      </div>
    </Card>
  );
};
