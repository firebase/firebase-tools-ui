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

/*
  This is the entry point for starting the server process for both
  static content and Emulator-UI-specific APIs. Please make sure to only use
  language features available in Node.js 8+ (i.e. no Type annotations).
*/

const express = require('express');
const fetch = require('node-fetch').default;
const path = require('path');
const { URL } = require('url');

/**
  Start an express app that serves both static content and APIs.
*/
exports.startServer = function () {
  const app = express();
  exports.registerApis(app);
  const webDir = path.join(path.dirname(process.argv[1]), 'build');
  app.use(express.static(webDir));

  // Required for the router to work properly.
  app.get('*', function (req, res) {
    res.sendFile(path.join(webDir, 'index.html'));
  });

  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;
  app.listen(port, host, () => {
    console.log(`Web / API server started at ${host}:${port}`);
  });
  return app;
};

/*
  Add the API routes to an express app.

  These are also available through development server via ./setupProxy.js,
  however, hot-reloading DOES NOT WORK with this file. Restart instead.
*/
exports.registerApis = function (app) {
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
    jsonHandler(async (req) => {
      const hubDiscoveryUrl = new URL(`http://${hubHost}/emulators`);
      hubDiscoveryUrl.hostname = fixHostname(hubDiscoveryUrl.hostname);
      const emulatorsRes = await fetch(hubDiscoveryUrl.toString());
      const emulators = await emulatorsRes.json();

      const json = { projectId, ...emulators };

      if (json.firestore) {
        try {
          const result = await discoverFirestoreWs(json.firestore);
          Object.assign(json.firestore, result);
        } catch (_) {
          // ignored
        }
      }

      return json;
    })
  );
};

async function discoverFirestoreWs(firestore) {
  const discoveryUrl = new URL('http://placeholder/ws/discovery');
  discoveryUrl.hostname = fixHostname(firestore.host);
  discoveryUrl.port = firestore.port;

  const wsDiscoveryRes = await fetch(discoveryUrl.toString());
  const { url } = await wsDiscoveryRes.json();
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
function fixHostname(host) {
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

function jsonHandler(handler) {
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

// When this file is ran directly like `node server.js`, just start the server.
if (require.main === module) {
  exports.startServer();
}
