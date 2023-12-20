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

import { createServer } from 'http';
import type { ListenOptions } from 'net';
import * as path from 'path';

import express from 'express';
import fetch from 'node-fetch';

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
    const emulatorsRes = await fetch(hubDiscoveryUrl.toString());
    const emulators = (await emulatorsRes.json()) as any;

    const json = { projectId, experiments: [], ...emulators };

    // Googlers: see go/firebase-emulator-ui-usage-collection-design?pli=1#heading=h.jwz7lj6r67z8
    // for more detail
    if (process.env.FIREBASE_GA_SESSION) {
      json.analytics = JSON.parse(process.env.FIREBASE_GA_SESSION);
    }

    // pick up any experiments enabled with `firebase experiment:enable`
    if (process.env.FIREBASE_ENABLED_EXPERIMENTS) {
      json.experiments = JSON.parse(process.env.FIREBASE_ENABLED_EXPERIMENTS);
    }

    return json;
  })
);

export const viteNodeApp = app;

if (import.meta.env.PROD) {
  const webDir = path.join(path.dirname(process.argv[1]), '..', 'client');
  app.use(express.static(webDir));
  // Required for the router to work properly.
  app.get('*', function (_, res) {
    res.sendFile(path.join(webDir, 'index.html'));
  });

  let listen: ListenOptions[];
  if (process.env.LISTEN) {
    listen = JSON.parse(process.env.LISTEN);
  } else {
    // Mainly used when starting in dev mode (without CLI).
    const host = process.env.HOST || '127.0.0.1';
    const port = Number(process.env.PORT) || 5173;
    listen = [{ host, port }];
  }
  for (const opts of listen) {
    const server = createServer(app).listen(opts);
    server.once('listening', () => {
      console.log(`Web / API server started at ${opts.host}:${opts.port}`);
    });
    server.once('error', (err) => {
      console.error(`Failed to start server at ${opts.host}:${opts.port}`);
      console.error(err);
      if (opts === listen[0]) {
        // If we failed to listen on the primary address, surface the error.
        process.exit(1);
      }
    });
  }
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
