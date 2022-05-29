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
import { Markdown } from '../../../../common/Markdown';
import { useExtension } from '../../../api/useExtension';
import { ParamType } from '../../../models';
import styles from './EventsConfig.module.scss';
import { ParamValue } from './ParamValue';

export function EventsConfig() {
  const extension = useExtension()!;
  const eventsByPrefix: Map<string, string[]> = new Map(); // maps prefix ==> list of types
  const eventDescriptionMapping: Map<string, string> = new Map(); // maps type ==> description
  let allowedEventTypesDiv;
  let channelLocationDiv;
  !!extension.events &&
    extension.events.forEach((event) => {
      eventDescriptionMapping.set(event.type, event.description);
    });
  if (!!extension.allowedEventTypes && extension.allowedEventTypes.length > 0) {
    extension.allowedEventTypes.forEach((eventType) => {
      const prefix = eventType.split('.').slice(0, -1).join('.');
      if (!eventsByPrefix.get(prefix)) {
        eventsByPrefix.set(prefix, [eventType]);
      } else {
        eventsByPrefix.get(prefix)?.push(eventType);
      }
    });
    const allowedEventTypeElements = Array.from(eventsByPrefix.keys())
      .sort()
      .map((prefix) => {
        const events = eventsByPrefix.get(prefix)?.map((event) => {
          return (
            <div key={`${event}`} className={styles.eventValue}>
              <ParamValue value={event} type={ParamType.STRING} />
              <Typography use="body1" theme="secondary">
                {eventDescriptionMapping.get(event) || 'Not Specified'}
              </Typography>
            </div>
          );
        });
        return (
          <div key={`${prefix}`} className={styles.eventPrefixValue}>
            <ParamValue value={prefix} type={ParamType.STRING} />
            {events}
          </div>
        );
      });
    allowedEventTypesDiv = (
      <div key="allowedEventTypes" className={styles.paramWrapper}>
        <Accordion
          expansionLabel="Description"
          title={
            <Typography use="body2" theme="secondary">
              Types of events
            </Typography>
          }
        >
          <Typography
            className={styles.description}
            use="caption"
            tag="div"
            theme="secondary"
          >
            <Markdown>
              Which events do you want to be emitted from this extension? Only
              selected events will be published to Eventarc, all other events
              will be ignored and will not be counted against Eventarc usage.
            </Markdown>
          </Typography>
        </Accordion>
        {allowedEventTypeElements}
      </div>
    );
  }
  if (!!extension.eventarcChannel) {
    const location = extension.eventarcChannel.split('/')[3];
    channelLocationDiv = (
      <div key="channelLocation" className={styles.paramWrapper}>
        <Accordion
          expansionLabel="Description"
          title={
            <Typography use="body2" theme="secondary">
              Channel location
            </Typography>
          }
        >
          <Typography
            className={styles.description}
            use="caption"
            tag="div"
            theme="secondary"
          >
            <Markdown>
              Where do you want to deploy the Eventarc channel where events will
              be published? You usually want a location close to where your
              extension is deployed, but choosing the default location
              (us-central1) makes it easier to create event handler functions.
            </Markdown>
          </Typography>
        </Accordion>
        <ParamValue value={location} type={ParamType.STRING} />
      </div>
    );
  }
  return (
    <div>
      <div className={styles.paramWrapper}>
        <h4>Enabled Events</h4>
        <Typography
          className={styles.description}
          use="caption"
          tag="div"
          theme="secondary"
        >
          If you enable events, you can{' '}
          <a href="https://firebase.google.com/docs/extensions/install-extensions#eventarc">
            write custom event handlers
          </a>{' '}
          that respond to these events. Events will be emitted via Eventarc.{' '}
          <a href="https://cloud.google.com/eventarc/pricing)">Fees apply.</a>
          <br />
          <a href={`/extensions/${extension.id}`}>
            How do events in this extension work?
          </a>
        </Typography>
      </div>
      {channelLocationDiv}
      {allowedEventTypesDiv}
    </div>
  );
}
