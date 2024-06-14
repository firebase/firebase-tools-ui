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

import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { getCustomAuthActionUri } from '../../../store/auth/selectors';
import styles from '../OneAccountPerEmailCard/OneAccountPerEmailCard.module.scss'; // styles are the same
import CustomAuthActionUriDialog from './CustomAuthActionUriDialog';

export type CustomAuthActionUriCardProps = PropsFromStore;
export const CustomAuthActionUriCard: React.FC<
  React.PropsWithChildren<CustomAuthActionUriCardProps>
> = ({ customAuthActionUri }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className={styles.wrapper}>
        {customAuthActionUri ? (
          <div>
            <Typography
              use="headline6"
              tag="div"
              theme="textPrimaryOnBackground"
            >
              Custom Auth Action Handler
            </Typography>
            <Typography use="body2" theme="textPrimaryOnBackground">
              The emulator will output links to your custom handler
              for auth actions like resetting passwords.{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://support.google.com/firebase/answer/7000714#actionlink"
              >
                Learn more
              </a>
            </Typography>
          </div>
        ) : (
          <div>
            <Typography
              use="headline6"
              tag="div"
              theme="textPrimaryOnBackground"
            >
              Default Auth Action Handler
            </Typography>
            <Typography use="body2" theme="textPrimaryOnBackground">
              The emulator will output links to its default handler
              for auth actions like resetting passwords.
            </Typography>
          </div>
        )}

        <div>
          <Button outlined={true} onClick={() => setOpen(true)}>
            Change
          </Button>
        </div>
      </Card>
      {open && <CustomAuthActionUriDialog onClose={() => setOpen(false)} />}
    </>
  );
};
export const mapStateToProps = createStructuredSelector({
  customAuthActionUri: getCustomAuthActionUri,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;
export default connect(mapStateToProps)(CustomAuthActionUriCard);
