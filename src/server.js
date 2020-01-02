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
const fs = require('fs');
const path = require('path');

/**
  Start an express app that serves both static content and APIs.
*/
exports.startServer = function() {
  const app = express();
  exports.registerApis(app);
  app.use(express.static(path.join(__dirname, '..', 'build')));

  // Required for the router to work properly.
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });

  app.listen(process.env.PORT || 3000);
  return app;
};

/*
  Add the API routes to an express app.

  These are also available through development server via ./setupProxy.js,
  however, hot-reloading DOES NOT WORK with this file. Restart instead.
*/
exports.registerApis = function(app) {
  const projectId = process.env.GCLOUD_PROJECT;
  if (!projectId) {
    throw new Error(
      'Please specify the GCLOUD_PROJECT environment variable.\n' +
        '(Are you using firebase-tools@>=7.11.0 with `--project your-project`?)'
    );
  }
  // Exposes the host and port of various emulators to facilitate accessing
  // them using client SDKs. For features that involve multiple emulators or
  // hard to accomplish using client SDKs, consider adding an API below.
  app.get('/api/config', getEmulatorsConfig.bind(null, projectId));
};

function getEmulatorsConfig(projectId, req, res) {
  res.status(200).json({
    projectId,
    database: process.env.FIREBASE_DATABASE_EMULATOR_HOST
      ? { hostAndPort: process.env.FIREBASE_DATABASE_EMULATOR_HOST }
      : undefined,
    firestore: process.env.FIRESTORE_EMULATOR_HOST
      ? { hostAndPort: process.env.FIRESTORE_EMULATOR_HOST }
      : undefined,
  });
}

function serveIndexHtml(req, res) {
  const indexFile = path.join(__dirname, '..', 'build', 'index.html');
  const indexTemplate = fs.readFileSync(indexFile, 'utf-8');
  res.status(200).end(indexTemplate);
}

// When this file is ran directly like `node server.js`, just start the server.
if (require.main === module) {
  exports.startServer();
}
