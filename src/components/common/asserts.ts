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

/**
 * Asserts that a condition is truthy, or throw an error.
 * @param assertion the condition to be asserted truthy.
 * @param error the error message to be thrown if assertion is falsy.
 */
export function assert(
  assertion: unknown,
  error: string = 'Assertion error'
): asserts assertion {
  if (!assertion) {
    throw new Error(error);
  }
}
