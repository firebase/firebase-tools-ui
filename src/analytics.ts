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

import { fetchMaybeWithCredentials } from './components/common/rest_api';
import { scrubPathData } from './routes';
import { AnalyticsSession, Config } from './store/config';

const GTAG_URL = 'https://www.googletagmanager.com/gtag/js';
const USAGE_CONFIG_API = '/api/config';

// Types for gtag
// https://developers.google.com/analytics/devguides/collection/gtagjs#install_the_global_site_tag
interface WindowWithGA extends Window {
  _gtag: Gtag.Gtag;
  [key: `ga-disable-${string}`]: boolean;
}

/**
 * Used to report usage data to Google Analytics.
 *
 * api: https://developers.google.com/tag-platform/gtagjs/reference#event
 *
 * Only sends data to Google Analytics if a user has opted in to collect usage
 * in the Firebase CLI. Data can be added before the gtag SDK loads.
 *
 *
 * Asynchronously kicks off a request to the UI server
 * to confirm that events should continue to be sent to
 * the Analytics backend
 *
 */
export const gtag: Gtag.Gtag = function () {
  initGtag();
  (window as unknown as WindowWithGA)._gtag.apply(
    window,
    arguments as unknown as Parameters<Gtag.Gtag>
  );
};

let loadedMeasurementId: string | undefined = undefined;

function disableGtag() {
  if (loadedMeasurementId) {
    (window as unknown as WindowWithGA)[`ga-disable-${loadedMeasurementId}`] =
      true;
  }
}

/**
 * Gets scrubbed Analytics config values
 * for `page_view` related data:
 *
 * [`page_title`](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#page_title)
 * [`page_location`](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#page_location)
 * [`page_referrer`](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#page_referrer)
 */
export function _getPageConfig() {
  const pageUrl = new URL(window.location.href);

  let scrubbedReferrer;
  if (document.referrer) {
    const referrerUrl = new URL(document.referrer);

    // scrub only if referrer is the emulator UI itself
    if (pageUrl.host === referrerUrl.host) {
      // scrub path
      const { scrubbedPath: scrubbedReferrerPath } = scrubPathData(
        referrerUrl.pathname
      );
      referrerUrl.pathname = scrubbedReferrerPath;

      // scrub other URL fields
      referrerUrl.port = '';
      referrerUrl.hostname = 'redacted';
      referrerUrl.hash = '';
      referrerUrl.search = '';
    }

    scrubbedReferrer = referrerUrl.toString();
  }

  // scrub path
  const { scrubbedPath, pathLabel: label } = scrubPathData(pageUrl.pathname);
  pageUrl.pathname = scrubbedPath;

  // scrub other URL fields
  pageUrl.port = '';
  pageUrl.hostname = 'redacted';
  pageUrl.hash = '';
  pageUrl.search = '';

  return {
    page_title: label,
    page_location: pageUrl.toString(),
    ...(scrubbedReferrer ? { page_referrer: scrubbedReferrer } : {}),
  };
}

/**
 * Call on every navigation. Set a scrubbed URL as the page location
 * instead of using the full URL
 */
export function scrubAnalyticsPageData() {
  if (loadedMeasurementId) {
    gtag('config', loadedMeasurementId, _getPageConfig());
  }
}

/**
 * Check for Analytics consent and enable/disable gtag accordingly
 */
export async function initGtag() {
  let session: AnalyticsSession | undefined;
  try {
    const response = await fetchMaybeWithCredentials(USAGE_CONFIG_API);
    const responseJson: Config = await response.json();
    session = responseJson.analytics;
  } catch (error) {
    // no point in collecting analytics if we can't connect to the UI server
    console.warn(
      `Got error "${
        (error as Error).message
      }" when checking for permission to collect usage.` +
        '\n' +
        'Disabling usage collection.'
    );
    return disableGtag();
  }

  // if config is missing, turn off analytics
  if (!session) {
    return disableGtag();
  }

  const { measurementId } = session;

  if (loadedMeasurementId) {
    if (loadedMeasurementId !== measurementId) {
      // Measurement ID has changed since the GTAG script tag was loaded. Given
      // that we don't have a way to replace the script, we'll just start new.
      disableGtag();
      window.location.reload();
      return;
    }
  } else {
    // only init gtag if it isn't already initialized
    loadedMeasurementId = measurementId;
    gtag('consent', 'default', {
      ad_storage: 'denied',

      // Causes requests to sent for modeling only (excluded from reports).
      ...(session.validateOnly ? { analytics_storage: 'denied' } : undefined),
    });

    // set up analytics
    // analytics won't be reported to the server unless developer has opted-in
    // https://developers.google.com/analytics/devguides/collection/gtagjs/#install_the_global_site_tag
    gtag('config', measurementId, {
      // match the client and session in the CLI
      client_id: session.clientId,
      session_id: session.sessionId,

      // Disable persistence just in case the document.cookie mock above fails.
      // https://developers.google.com/analytics/devguides/collection/gtagjs/cookies-user-id
      cookie_expires: 0,
      cookie_update: false,

      // https://support.google.com/analytics/answer/7201382?hl=en
      // To turn debug mode off, `debug_mode` must be left out not `false`.
      ...(session.debugMode ? { debug_mode: true } : {}),
      ..._getPageConfig(),
    });

    mockCookies();

    /**
     * Lazy import gtag the same way the Firebase JS SDK does
     * https://github.com/firebase/firebase-js-sdk/blob/86befb3f0189d5218c3316ab7c8977410a1a35da/packages/analytics/src/helpers.ts#L39-L49
     */
    const script = document.createElement('script');
    script.src = `${GTAG_URL}?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);
  }
  delete (window as unknown as WindowWithGA)[`ga-disable-${measurementId}`];
}

// Mock document.cookie to prevent gtag from actually creating cookies but keep
// its behavior the same. Our mock handles key=value but ignores all options.
// There's no need to support path/domain/expires/etc. for our use case.
// TODO: If gtag / GA4 ever adds support for custom persistence, just do that.
function mockCookies() {
  const cookies = new Map();
  Object.defineProperty(document, 'cookie', {
    set(input) {
      // BEGIN (Group 1: name) equal sign (Group 2: value). Ignore the rest.
      const m = /^([^=]+)=([^;]+)/.exec(input);
      if (m) {
        cookies.set(m[1].trim(), m[2]);
        // console.debug('Setting mock cookie:', input, m[1], m[2]);
      }
    },
    get() {
      const result: string[] = [];
      cookies.forEach((v, k) => {
        result.push(k + '=' + v);
      });
      return result.join('; ');
    },
  });
}
