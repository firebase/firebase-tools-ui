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

/**
  This file tells `npm start` (or more precisely, `react-scripts start`) to load
  middlewares and APIs defined in ../server.js into the Webpack Dev Server, so
  that those things work as expected during development.

  Note that setupProxy is probably the wrong name for this file -- it never
  proxies anything. Instead, it just enhances the dev express app itself.
  It's only named setupProxy.js so that react-scripts can pick it up. See also:
  https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually
*/

const registerApis = require('../server').registerApis;
module.exports = registerApis;
