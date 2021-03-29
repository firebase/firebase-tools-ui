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

// This has been copied as is from firebase-tools
// https://github.com/FirebasePrivate/firebase-tools/blob/15a582cd2d92ad7477e9364a61bb17a98478fe8e/src/profileReport.js#L77
const formatNumber = function (num: number) {
  var parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (+parts[1] === 0) {
    return parts[0];
  }
  return parts.join('.');
};

export const formatBytes = function (bytes: number) {
  var threshold = 1000;
  if (Math.round(bytes) < threshold) {
    return bytes + ' B';
  }
  var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var u = -1;
  var formattedBytes = bytes;
  do {
    formattedBytes /= threshold;
    u++;
  } while (Math.abs(formattedBytes) >= threshold && u < units.length - 1);
  return formatNumber(formattedBytes) + ' ' + units[u];
};
