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

import * as dns from 'dns';
import * as path from 'path';

import express from 'express';
import fetch from 'node-fetch';

dns.setDefaultResultOrder('ipv4first');

/*
  This file defines Node.js server-side logic for the Emulator UI.

  During development, the express app is loaded into the Vite dev server
  (configured via ./vite.config.ts) and exposes the /api/* endpoints below.

  For production, this file serves as an entry point and runs additional logic
  (see `import.meta.env.PROD` below) to start the server on a port which serves
  static assets in addition to APIs.

  This file may NOT import any front-end code or types from src/.
*/
const app = express();

const projectEnv = 'GCLOUD_PROJECT';
const hubEnv = 'FIREBASE_EMULATOR_HUB';
const projectId = process.env[projectEnv];
const hubHost = process.env[hubEnv];
if (!projectId || !hubHost) {
  throw new Error(
    `Please specify these environment variables: ${projectEnv} ${hubEnv}\n` +
      '(Are you using firebase-tools@>=7.14.0 with `--project your-project`?)'
  );
}

// Exposes the host and port of various emulators to facilitate accessing
// them using client SDKs. For features that involve multiple emulators or
// hard to accomplish using client SDKs, consider adding an API below.
app.get(
  '/api/config',
  jsonHandler(async () => {
    const hubDiscoveryUrl = new URL(`http://${hubHost}/emulators`);
    hubDiscoveryUrl.hostname = fixHostname(hubDiscoveryUrl.hostname);
    const emulatorsRes = await fetch(hubDiscoveryUrl.toString());
    const emulators = (await emulatorsRes.json()) as any;

    const json = { projectId, ...emulators };

    if (json.firestore) {
      try {
        const result = await discoverFirestoreWs(json.firestore);
        Object.assign(json.firestore, result);
      } catch {
        // ignored
      }
    }

    // Googlers: see go/firebase-emulator-ui-usage-collection-design?pli=1#heading=h.jwz7lj6r67z8
    // for more detail
    if (process.env.FIREBASE_GA_SESSION) {
      json.analytics = JSON.parse(process.env.FIREBASE_GA_SESSION);
    }

    return json;
  })
);

export const viteNodeApp = app;

if (import.meta.env.PROD) {
  const host = process.env.HOST || 'localhost';
  const port = Number(process.env.PORT) || 3000;
  const webDir = path.join(path.dirname(process.argv[1]), '..', 'client');
  app.use(express.static(webDir));
  // Required for the router to work properly.
  app.get('*', function (_, res) {
    res.sendFile(path.join(webDir, 'index.html'));
  });
  app.listen(port, host, () => {
    console.log(`Web / API server started at ${host}:${port}`);
  });
}

/* Helper functions */

async function discoverFirestoreWs(firestore: { host: string; port: number }) {
  const discoveryUrl = new URL('http://placeholder/ws/discovery');
  discoveryUrl.hostname = fixHostname(firestore.host);
  discoveryUrl.port = firestore.port.toString();

  const wsDiscoveryRes = await fetch(discoveryUrl.toString());
  const { url } = (await wsDiscoveryRes.json()) as { url?: string };
  if (!url) {
    throw new Error('Invalid discovery response (no url field).');
  }
  const parsed = new URL(url);

  // Remove [] brackets around IPv6 addr to be consistent with other emulators.
  const webSocketHost = parsed.hostname.replace(/\[/g, '').replace(/\]/g, '');
  const webSocketPort = Number(parsed.port || '80');
  if (!webSocketPort) {
    throw new Error(`Invalid port in discovery URL: ${parsed}`);
  }
  return { webSocketHost, webSocketPort };
}

/**
 * Return a connectable hostname, replacing wildcard 0.0.0.0 or :: with loopback
 * addresses 127.0.0.1 / ::1 correspondingly. See below for why this is needed:
 * https://github.com/firebase/firebase-tools-ui/issues/286
 *
 * This assumes emulators are running on the same device as the Emulator UI
 * server, which should hold if both are started from the same CLI command.
 */
function fixHostname(host: string): string {
  if (host.indexOf(':') >= 0 && host.indexOf('[') < 0) {
    // Add brackets to IPv6 address.
    host = `[${host}]`;
  }
  if (host === '0.0.0.0') {
    host = '127.0.0.1';
  } else if (host === '[::]') {
    host = '[::1]';
  }
  return host;
}

function jsonHandler(
  handler: (req: express.Request) => Promise<object>
): express.Handler {
  return (req, res) => {
    handler(req).then(
      (body) => {
        res.status(200).json(body);
      },
      (err) => {
        console.error(err);
        res.status(500).json({
          message: err.message,
          stack: err.stack,
          raw: err,
        });
      }
    );
  };
}
