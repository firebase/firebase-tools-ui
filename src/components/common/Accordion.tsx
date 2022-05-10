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

import { randomId } from '@rmwc/base';
import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';

import styles from './Accordion.module.scss';

export interface AccordionProps {
  title: string | JSX.Element;
  expansionLabel?: string;
  isExpanded?: boolean;
}

export const Accordion: React.FC<React.PropsWithChildren<AccordionProps>> = ({
  isExpanded = false,
  title,
  expansionLabel,
  children,
}) => {
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(isExpanded);
  const contentId = randomId('accordion-content');
  const headerId = randomId('accordion-header');
  return (
    <section className={styles.accordion}>
      <header
        tabIndex={0}
        role="button"
        id={headerId}
        aria-controls={contentId}
        aria-expanded={isAccordionExpanded}
        onClick={() => setIsAccordionExpanded(!isAccordionExpanded)}
        onKeyDown={(e) =>
          (e.key === ' ' || e.key === 'Enter') &&
          setIsAccordionExpanded(!isAccordionExpanded)
        }
        className={`${styles.header} ${
          isAccordionExpanded ? '' : styles.collapsed
        } accordion-header`}
      >
        <Typography use="body1" className={styles.title}>
          {title}
        </Typography>

        {/* TODO(kirjs): Play animations. */}
        <div className={styles.expandHeader}>
          {expansionLabel && (
            <Typography use="body2" className={styles.expansionLabel}>
              {expansionLabel}
            </Typography>
          )}
          {isAccordionExpanded ? (
            <Icon icon="expand_less" className={styles.icon} />
          ) : (
            <Icon icon="expand_more" className={styles.icon} />
          )}
        </div>
      </header>
      {isAccordionExpanded && (
        <div
          className={styles.content}
          aria-labelledby={headerId}
          id={contentId}
        >
          {children}
        </div>
      )}
    </section>
  );
};
