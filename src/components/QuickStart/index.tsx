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

import './index.scss';

import { Card } from '@rmwc/card';
import { GridCell } from '@rmwc/grid';
import { CollapsibleList, SimpleListItem } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../store';
import { Config } from '../../store/config';
import { getConfig } from '../../store/config/selectors';
import { squash } from '../../store/utils';
import { Spinner } from '../common/Spinner';

export const mapStateToProps = createStructuredSelector({
  configRemote: getConfig,
});

export type PropsFromState = ReturnType<typeof mapStateToProps>;
export type Props = PropsFromState;

export const Home: React.FC<Props> = ({ configRemote }) =>
  squash(configRemote, {
    onNone: () => <Spinner span={12} message="Loading QuickStart Guide..." />,
    onData: config => <QuickStart config={config} />,
    onError: () => <QuickStart config={{}} />,
  });

export default connect(mapStateToProps)(Home);

const QuickStart: React.FC<{
  config: Partial<Config>;
}> = ({ config }) => {
  return (
    <>
      {config.firestore && (
        <GridCell span={12} className="QuickStart-Help-Section">
          <Card>
            <CollapsibleList
              handle={
                <SimpleListItem
                  text={
                    <Typography use="headline6">Firestore Emulator</Typography>
                  }
                  metaIcon="chevron_right"
                />
              }
              defaultOpen={true}
            >
              <Typography use="headline6" tag="h3">
                Android, iOS, and Web SDKs
              </Typography>
              <Typography use="body1" tag="p">
                Set up your in-app configuration or test classes to interact
                with Cloud Firestore as follows.
              </Typography>
              <iframe
                src="/docs/emulator-suite/_includes/_firestore_instrument.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
              {config.functions && (
                <Typography use="body1" tag="p">
                  No additional setup is needed to test Cloud Functions{' '}
                  <a href="https://firebase.google.com/docs/functions/firestore-events">
                    triggered by Firestore events
                  </a>{' '}
                  using the emulator.
                </Typography>
              )}
              <Typography use="headline6" tag="h3">
                Admin SDKs
              </Typography>
              <iframe
                src="/docs/emulator-suite/_includes/_firestore_admin_quickstart.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
            </CollapsibleList>
          </Card>
        </GridCell>
      )}
      {config.database && (
        <GridCell span={12} className="QuickStart-Help-Section">
          <Card>
            <CollapsibleList
              handle={
                <SimpleListItem
                  text={
                    <Typography use="headline6">
                      Realtime Database Emulator
                    </Typography>
                  }
                  metaIcon="chevron_right"
                />
              }
              defaultOpen={true}
            >
              <Typography use="headline6" tag="h3">
                Android, iOS, and Web SDKs
              </Typography>
              <Typography use="body1" tag="p">
                Set up your in-app configuration or test classes to interact
                with Realtime Database as follows.
              </Typography>
              <iframe
                src="/docs/emulator-suite/_includes/_rtdb_instrument.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
              {config.functions && (
                <Typography use="body1" tag="p">
                  No additional setup is needed to test Cloud Functions{' '}
                  <a href="https://firebase.google.com/docs/functions/database-events">
                    triggered by Realtime Database events
                  </a>{' '}
                  using the emulator.
                </Typography>
              )}
              <Typography use="headline6" tag="h3">
                Admin SDKs
              </Typography>
              <iframe
                src="/docs/emulator-suite/_includes/_rtdb_admin_quickstart.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
            </CollapsibleList>
          </Card>
        </GridCell>
      )}
      {config.functions && (
        <GridCell span={12} className="QuickStart-Help-Section">
          <Card>
            <CollapsibleList
              handle={
                <SimpleListItem
                  text={
                    <Typography use="headline6">
                      Cloud Functions for Firebase Emulator
                    </Typography>
                  }
                  metaIcon="chevron_right"
                />
              }
              defaultOpen={true}
            >
              <iframe
                src="/docs/emulator-suite/_includes/_functions_instrument.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
              {(config.database || config.firestore || config.pubsub) && (
                <Typography use="body1" tag="p">
                  No additional setup is needed to test background-triggered
                  Cloud Functions by{' '}
                  <a href="https://firebase.google.com/docs/functions/database-events">
                    Realtime Database events
                  </a>
                  ,{' '}
                  <a href="https://firebase.google.com/docs/functions/firestore-events">
                    Cloud Firestore events
                  </a>
                  , or{' '}
                  <a href="https://firebase.google.com/docs/functions/pubsub-events">
                    Cloud Pub/Sub events
                  </a>{' '}
                  using the corresponding emulators.
                </Typography>
              )}
              <Typography use="headline6" tag="h3">
                Admin SDKs
              </Typography>
              <iframe
                src="/docs/emulator-suite/_includes/_rtdb_admin_quickstart.html"
                ref={resizeIframe}
                className="QuickStart-DocumentFrame"
              ></iframe>
            </CollapsibleList>
          </Card>
        </GridCell>
      )}
    </>
  );
};

function resizeIframe(frame: HTMLIFrameElement | null) {
  if (!frame) {
    return;
  }
  frame.onload = () => {
    if (frame && frame.contentWindow) {
      frame.style.height =
        frame.contentWindow.document.documentElement.scrollHeight + 20 + 'px';
    }
  };
}
