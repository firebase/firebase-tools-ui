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

import firebase from 'firebase';
import get from 'lodash.get';
import React, { ReactNode } from 'react';

import { FirestoreAny, FirestoreMap } from '../models';
import {
  compareFirestoreKeys,
  getFieldType,
  isArray,
  isMap,
  isTimestamp,
  summarize,
  summarizeArray,
  summarizeDate,
  summarizeLatLng,
  summarizeMap,
} from '../utils';
import {
  ExpressionPathSegmentValue,
  ExpressionValue,
  SimpleConstraint,
} from './ExpressionValue';

const DocumentStateContext = React.createContext<FirestoreMap | undefined>(
  undefined
);

export const DocumentProvider: React.FC<{
  value: FirestoreMap;
}> = ({ value, children }) => {
  return (
    <DocumentStateContext.Provider value={value}>
      {children}
    </DocumentStateContext.Provider>
  );
};

// Get the full data of the document. Can only be used within DocumentStateProvider.
export function useDocumentState(): FirestoreMap {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentState must be used within a DocumentStateProvider'
    );
  }
  return context;
}

// Get the value of the field at path. Can only be used within DocumentStateProvider.
export function useFieldState(path: string[]): FirestoreAny {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return get(documentState, path);
}

const ExpressionValueStateContext = React.createContext<
  ExpressionValue | undefined
>(undefined);

export const ExpressionValueStateProvider: React.FC<{
  value: ExpressionValue;
}> = ({ value, children }) => {
  return (
    <ExpressionValueStateContext.Provider value={value}>
      {children}
    </ExpressionValueStateContext.Provider>
  );
};

// Get information about field at path. Can be used within DocumentStateProvider
// (Firestore doc) or ExpressionValueStateProvider (rules value, readonly).
export function useFieldInfo(
  path: string[],
  options: { maxSummaryLen: number }
): {
  title: string;
  summary: ReactNode;
  childPaths: string[][] | null;
  typeDisp: string;
} {
  const documentState = React.useContext(DocumentStateContext);
  const exprState = React.useContext(ExpressionValueStateContext);
  if (documentState !== undefined) {
    const value = path.length === 0 ? documentState : get(documentState, path);
    let childPaths = null;

    if (isMap(value)) {
      childPaths = Object.keys(value)
        .sort(compareFirestoreKeys)
        .map((key) => [...path, key]);
    } else if (isArray(value)) {
      childPaths = value.map((_, index) => [...path, `${index}`]);
    }

    const summary = summarize(value, options.maxSummaryLen);
    return {
      title: isTimestamp(value) ? value.toDate().toISOString() : summary,
      summary: summary,
      childPaths,
      typeDisp: getFieldType(value),
    };
  } else if (exprState !== undefined) {
    let value =
      path.length === 0 ? exprState : (get(exprState, path) as ExpressionValue);

    let childPaths = null;

    if (value.mapValue) {
      childPaths = Object.keys(value.mapValue.fields ?? {})
        .sort(compareFirestoreKeys)
        .map((key) => [...path, 'mapValue', 'fields', key]);
    } else if (value.listValue) {
      childPaths = (value.listValue.values ?? []).map((_, index) => [
        ...path,
        'listValue',
        'values',
        `${index}`,
      ]);
    } else if (value.setValue) {
      childPaths = (value.setValue.values ?? []).map((_, index) => [
        ...path,
        'setValue',
        'values',
        `${index}`,
      ]);
    }
    if (value.constraintValue) {
      return {
        title: '',
        summary: summarizeConstraint(
          value.constraintValue,
          options.maxSummaryLen
        ),
        childPaths: null,
        typeDisp: 'constraint',
      };
    } else {
      const summary = summarizeExp(value, options.maxSummaryLen);
      return {
        title: value.timestampValue
          ? new Date(value.timestampValue).toISOString()
          : summary,
        summary: summary,
        childPaths,
        typeDisp: value.pathValue
          ? 'path'
          : (Object.keys(value)[0] || 'unknown').replace('Value', ''),
      };
    }
  } else {
    throw new Error(
      'useFieldInfo must be used within a DocumentStateProvider or ExpressionValueStateProvider'
    );
  }
}

function summarizeExp(value: ExpressionValue, maxLen: number): string {
  if ('nullValue' in value) {
    return 'null';
  } else if ('boolValue' in value) {
    return summarize(value.boolValue || false, maxLen);
  } else if ('intValue' in value) {
    return summarizeNumber(value.intValue);
  } else if ('floatValue' in value) {
    return summarizeNumber(value.floatValue);
  } else if ('stringValue' in value) {
    return summarize(value.stringValue || '', maxLen);
  } else if ('bytesValue' in value) {
    return summarize(
      firebase.firestore.Blob.fromBase64String(value.bytesValue || ''),
      maxLen
    );
  } else if ('durationValue' in value) {
    return value.durationValue || '0s';
  } else if ('timestampValue' in value) {
    const date = new Date(value.timestampValue || 0);
    return summarizeDate(date, maxLen);
  } else if ('latlngValue' in value) {
    return summarizeLatLng(
      value.latlngValue?.latitude || 0,
      value.latlngValue?.longitude || 0
    );
  } else if ('listValue' in value) {
    return summarizeArray(value.listValue?.values ?? [], maxLen, summarizeExp);
  } else if ('setValue' in value) {
    // TODO: Somehow make this look different than a list.
    return summarizeArray(value.setValue?.values ?? [], maxLen, summarizeExp);
  } else if ('mapValue' in value) {
    return summarizeMap(value.mapValue?.fields ?? {}, maxLen, summarizeExp);
  } else if ('pathValue' in value) {
    return '/' + summarizePath(value.pathValue, maxLen);
  } else if ('constraintValue' in value) {
    return '(Constraint)';
  } else if ('mapDiffValue' in value) {
    return '(MapDiff)'; // TODO
  } else if ('undefined' in value) {
    return `(Error: ${value.undefined?.causeMessage || 'unknown'})`; // TODO
  } else {
    const json = JSON.stringify(value);
    console.warn(`Unknown ExpressionValue type: ${json}`);
    return json;
  }
}

function summarizeNumber(value: number | string | undefined): string {
  if (value === undefined) {
    // JSON converted from protobuf may have default value omitted.
    return '0';
  }
  if (typeof value === 'string') {
    // int64 string (e.g. "123") or float "NaN" or "Infinity" etc.
    return value;
  }
  return value.toString();
}

function summarizePath(
  value: ExpressionValue['pathValue'],
  maxLen: number
): string {
  if (!value || !value.segments) return '';
  return value.segments.map((seg) => summarizeSegment(seg, maxLen)).join('/');
}

function summarizeSegment(
  value: ExpressionPathSegmentValue,
  maxLen: number
): string {
  if (value.simple) {
    return value.simple;
  } else if (value.capture) {
    return value.capture.boundValue || `{${value.capture.variableName}}`;
  } else if (value.globCapture) {
    if (value.globCapture.boundValue) {
      return summarizePath(value.globCapture.boundValue, maxLen);
    } else {
      return `{${value.globCapture.variableName}=**}`;
    }
  } else {
    return '';
  }
}

function summarizeConstraint(
  value: ExpressionValue['constraintValue'],
  maxLen: number
): ReactNode {
  const unknown = <span className="Constraint-unknown">χ</span>; // Greek letter x
  if (!value?.simpleConstraints?.length) {
    return unknown;
  }

  let firstCondition = true;
  const conditions: ReactNode[] = [];
  for (const constraint of value.simpleConstraints) {
    if (firstCondition) {
      conditions.push(<span className="Constraint-hint">where </span>);
      firstCondition = false;
    } else {
      conditions.push(<span className="Constraint-and"> &amp;&amp; </span>);
    }
    const { comparator, value } = constraint;
    if (!value) {
      throw new Error(
        `Constraint value unset in ${JSON.stringify(constraint)}`
      );
    }
    const valueStr = summarizeExp(value, maxLen);
    if (!comparator || comparator === 'UNSET_COMPARATOR') {
      throw new Error(
        `Constraint comparator unset in ${JSON.stringify(constraint)}`
      );
    } else if (comparator === 'LIST_CONTAINS') {
      conditions.push(
        <span>
          ({valueStr} in {unknown})
        </span>
      );
    } else {
      conditions.push(
        <span>
          {unknown} {COMPARATOR_DISP[comparator] || comparator} {valueStr}
        </span>
      );
    }
  }
  return (
    <span>
      {unknown} ({conditions})
    </span>
  );
}

const COMPARATOR_DISP: Record<
  Exclude<
    SimpleConstraint['comparator'],
    undefined | 'UNSET_COMPARATOR' | 'LIST_CONTAINS' // handled separately
  >,
  string
> = {
  EQ: '==',
  NEQ: '!=',
  GT: '>',
  GTE: '>=',
  LT: '<',
  LTE: '<=',
};
