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
import { Button } from '@rmwc/button';
import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { Link } from 'react-router-dom';

import { useExtension } from '../../../api/useExtension';
import { DetailItemCard } from '../DetailItemCard/DetailItemCard';
import styles from './ApisAndResources.module.scss';

const Apis: React.FC = () => {
  const extension = useExtension()!;

  return (
    <>
      <section className={styles.wrapper}>
        <Typography use="subtitle2" tag="h3">
          APIs
        </Typography>
        {(extension.apis || []).map((api) => (
          <DetailItemCard
            key={api.apiName}
            header={
              <div className={styles.titleWrapper}>
                <Icon icon={{ icon: 'build', size: 'small' }} />
                <Typography use="subtitle2" tag="h4">
                  {api.apiName}
                </Typography>
              </div>
            }
            content={api.reason}
          />
        ))}
      </section>
    </>
  );
};

// TODO(kirjs): Secrets

const Resources: React.FC = () => {
  const extension = useExtension()!;

  const functions = (extension.resources || []).map((r) => {
    return (
      <article key={r.name} className={styles.resourceItem}>
        <div className={styles.resourceItemHeader}>
          <div>{r.name}</div>
          <Link
            to={`/logs?q=metadata.function.name="${r.functionName}"`}
            className={styles.viewLogsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>View logs</Button>
          </Link>
        </div>
        <div>{r.description}</div>
      </article>
    );
  });

  return (
    <>
      <section className={styles.wrapper}>
        <Typography use="subtitle2" tag="h3">
          Resources
        </Typography>
        <DetailItemCard
          header={
            <div className={styles.headerWrapper}>
              <div className={styles.titleWrapper}>
                <Icon
                  icon={{
                    icon: 'auto_awesome',
                    size: 'small',
                  }}
                />
                <Typography use="subtitle2" tag="h4">
                  Cloud Functions
                </Typography>
              </div>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to={`/logs?q=metadata.extension.instanceId="${extension.id}"`}
                className={styles.viewLogsLink}
              >
                <Button outlined={true} theme={'secondary'}>
                  View all logs
                </Button>
              </Link>
            </div>
          }
          content={<>{functions}</>}
        />
      </section>
    </>
  );
};

export const ApisAndResources: React.FC = () => {
  return (
    <>
      <Resources />
      <Apis />
    </>
  );
};
