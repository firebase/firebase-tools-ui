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
 * Represents in what way each key is different between the two maps.
 */
export type ExpressionMapDiffValueKeyStatus =
  | 'UNCHANGED'
  | 'ADDED'
  | 'REMOVED'
  | 'CHANGED';

export interface ExpressionValue {
  /**
   * Represents a null value.
   */
  nullValue?: null;
  /**
   * Represents a boolean value.
   */
  boolValue?: boolean;
  /**
   * Represents a 64-bit integer value.
   */
  intValue?: number | string;
  /**
   * Represents a 64-bit floating point value.
   */
  floatValue?: number | string;
  /**
   * Represents a string value.
   */
  stringValue?: string;
  /**
   * Represents a sequence of bytes (octets). Bytes are treated as unsigned.
   */
  bytesValue?: string;
  /**
   * Represents a duration value.
   * A signed, fixed-length span of time represented as a count of seconds and fractions of seconds at nanosecond resolution. Examples: "8640000s.000000001s".
   */
  durationValue?: string;
  /**
   * Represents a timestamp value.
   * A timestamp in RFC3339 UTC "Zulu" format, with nanosecond resolution and up to nine fractional digits. Examples: "2014-10-02T15:01:23Z" and "2014-10-02T15:01:23.045123456Z".
   */
  timestampValue?: string;
  /**
   * Represents a latlng geo point value.
   */
  latlngValue?: {
    /**
     * The latitude in degrees. It must be in the range [-90.0, +90.0].
     *
     */
    latitude?: number;
    /**
     * The longitude in degrees. It must be in the range [-180.0, +180.0].
     *
     */
    longitude?: number;
  };
  /**
   * Represents a repeated 'ExpressionValue'.
   */
  listValue?: {
    /**
     * Repeated field of dynamically typed values.
     */
    values?: ExpressionValue[];
  };
  /**
   * Represents a set of 'ExpressionValue's.
   */
  setValue?: {
    /**
     * Repeated field of dynamically typed values with no duplicates.
     *  The order of the values has no significance.
     */
    values?: ExpressionValue[];
  };
  /**
   * Represents a structured value.
   */
  mapValue?: {
    /**
     * Map of dynamically typed values.
     */
    fields?: {
      [k: string]: ExpressionValue;
    };
  };
  /**
   * Represents a path value.
   */
  pathValue?: {
    /**
     * List of `ExpressionPathSegmentValue` comprising the path.
     */
    segments?: ExpressionPathSegmentValue[];
  };
  /**
   * Represents a constraint value. e.g.  `> 3` &&  `< 3`. * /
   */
  constraintValue?: {
    /**
     * Set of all the constraints that are 'AND`ed together.
     */
    simpleConstraints?: SimpleConstraint[];
  };
  /**
   * Represents the result of comparison between two ExpressionMapValues.
   */
  mapDiffValue?: {
    /**
     * The status for each key in two ExpressionMapValues.
     *  A key is included if it appears in at least one side.
     */
    keyStatuses?: {
      [k: string]: ExpressionMapDiffValueKeyStatus;
    };
  };
  /**
   * Represents an undefined value.
   */
  undefined?: {
    /**
     * Position in the source at which point the undefined behavior occurs.
     */
    sourcePosition?: {
      /**
       * Name of the `File`.
       */
      fileName?: string;
      /**
       * Index of the `File` in the `Source` message where the content appears.
       *  Output only.
       */
      fileIndex?: number;
      /**
       * Line number of the source fragment. 1-based.
       */
      line?: number;
      /**
       * First column on the source line associated with the source fragment.
       */
      column?: number;
      /**
       * Start position relative to the beginning of the file.
       */
      currentOffset?: number;
      /**
       * End position relative to the beginning of the file.
       */
      endOffset?: number;
    };
    /**
     * String message indicating why the behavior is undefined. May be used for
     *  error reporting during later stages of execution.
     */
    causeMessage?: string;
  };
}
/**
 * Represents a segment inside a path expression. Each segment can be one of the
 *  followings:
 *
 *  *    Simple path. e.g. /hello or /$("test")
 *  *    Capture. e.g. /{hello}. This type can optionally be bound. The bound
 *       value is available inside the value.
 *  *    Glob. e.g. /{hello=**}. This type can  optionally be bound. The bound
 *       value is available inside the value.
 */
export interface ExpressionPathSegmentValue {
  /**
   * A simple path, e.g. /simple
   */
  simple?: string;
  /**
   * Single-segment capture expression, e.g. /{name}
   */
  capture?: {
    /**
     * Capture variable name.
     */
    variableName?: string;
    /**
     * Capture value is a url decoded string for single segment matches.
     */
    boundValue?: string;
  };
  /**
   * Multi-segment capture expression using glob capture, e.g. /{name=**}
   */
  globCapture?: {
    /**
     * Glob variable name.
     */
    variableName?: string;
    /**
     * Captured value for globs is a path expression.
     */
    boundValue?: {
      /**
       * List of `ExpressionPathSegmentValue` comprising the path.
       */
      segments?: ExpressionPathSegmentValue[];
    };
  };
}
/**
 * Simple constraint like  > 5.
 */
export interface SimpleConstraint {
  /**
   * Comparator for constraint.
   */
  comparator?:
    | 'UNSET_COMPARATOR'
    | 'EQ'
    | 'NEQ'
    | 'GT'
    | 'GTE'
    | 'LT'
    | 'LTE'
    | 'LIST_CONTAINS';
  /**
   * Value to compare with.
   */
  value?: ExpressionValue;
}
