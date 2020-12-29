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

/**
  Start an express app that serves both static content and APIs.
*/
exports.startServer = function () {
  const app = express();
  exports.registerApis(app);
  const webDir = path.join(path.dirname(process.argv[1]), 'build')
  app.use(express.static(webDir));

  // Required for the router to work properly.
  app.get('*', function (req, res) {
    res.sendFile(path.join(webDir, 'index.html'));
  });

  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;
  app.listen(port, host, () => {
    console.log(`Web / API server started at http://${hostAndPort(host, port)}`);
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
  const hubEnv = 'FIREBASE_EMULATOR_HUB'
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
  app.get('/api/config', jsonHandler(async (req) => {
    const emulatorsRes = await fetch(`http://${hubHost}/emulators`);
    const emulators = await emulatorsRes.json();

    const json = { projectId };
    Object.entries(emulators).forEach(([name, info]) => {
      let host = info.host;
      if (host === '0.0.0.0') {
        host = '127.0.0.1';
      } else if (host === '::') {
        host = '::1';
      }
      json[name] = {
        ...info,
        host,
        hostAndPort: hostAndPort(host, info.port),
      }
    });
    return json;
  }));
};

function hostAndPort(host, port) {
  // Correctly put IPv6 addresses in brackets.
  return host.indexOf(':') >= 0 ? `[${host}]:${port}` : `${host}:${port}`;
}

function jsonHandler(handler) {
  return ((req, res) => {
    handler(req).then((body) => {
      res.status(200).json(body);
    }, (err) => {
      console.error(err);
      res.status(500).json({
        message: err.message,
        stack: err.stack,
        raw: err,
      });
    })
  });
}

// When this file is ran directly like `node server.js`, just start the server.
if (require.main === module) {
  exports.startServer();
}
