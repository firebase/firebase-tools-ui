import { Button } from '@rmwc/button';
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
import { Typography } from '@rmwc/typography';

import { Accordion } from '../../../../common/Accordion';
import { Callout } from '../../../../common/Callout';
import { DOCS_BASE } from '../../../../common/links/DocsLink';
import { Markdown } from '../../../../common/Markdown';
import { useExtension } from '../../../api/useExtension';
import { EventsConfig } from './EventsConfig';
import styles from './ParamList.module.scss';
import { ParamValue } from './ParamValue';
import { isDynamicExtension } from '../../../api/useExtensions';

function ParamList() {
  const extension = useExtension()!;
  const isDynamic = isDynamicExtension(extension);
  const docSuffix = isDynamic ?
    'extensions/manage-installed-extensions?interface=sdk#reconfigure' :
    'extensions/manifest';

  const dynamicFragment = (
    <Typography use="body2">
      Reconfigure is not available in the emulator. You can
      reconfigure parameters by updating them in the code.
      Then rebuild the code if applicable and refresh this page.
    </Typography>
  );

  const staticFragment = (
    <>
    <Typography use="body2">
      Reconfigure is not available in the emulator. You can
      reconfigure parameters by updating your .env files with:
    </Typography>
    <br />
    <code>firebase ext:configure {extension.id} --local</code>)
    </>
  )

  return (
    <div>
      <div className={styles.paramHeader}>
        <Callout aside type="note">
            {isDynamic ? dynamicFragment : staticFragment}
            <div className={styles.learnButton}>
              <a
                href={DOCS_BASE + docSuffix}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
              >
                <Button>Learn more</Button>
              </a>
            </div>
        </Callout>
      </div>
      {(extension.params || []).map((param) => {
        return (
          <div key={param.param} className={styles.paramWrapper}>
            <Accordion
              expansionLabel="Description"
              title={
                <Typography use="body2" theme="secondary">
                  {param.label}
                </Typography>
              }
            >
              <Typography
                className={styles.description}
                use="caption"
                tag="div"
                theme="secondary"
              >
                <Markdown>{param.description || ''}</Markdown>
              </Typography>
            </Accordion>

            <ParamValue
              value={param.value || param.default || ''}
              type={param.type}
            />
          </div>
        );
      })}
      <EventsConfig />
    </div>
  );
}

export default ParamList;
