import { isDraft, original } from 'immer';
import deepEquals from 'lodash.isequal';
import { ReactElement } from 'react';

export interface ErrorInfo {
  message: string;
}

/* Represents result of a task, either success (with data) or error. */
export type Result<T, E = ErrorInfo> = DataResult<T> | ErrorResult<E>;
export type DataResult<T> = { data: T };
export type ErrorResult<E> = { error: E };

// Type helper to extract the type of T.data.
export type DataTypeOf<T extends Result<any, any>> = T extends Result<
  infer D,
  any
>
  ? D
  : any;

export type DataTypeIfPresent<
  T extends Result<any, any> | undefined
> = T extends DataResult<infer D> ? D : never;

// Type helper to extract the type of T.error.
export type ErrorTypeOf<T extends Result<any, any>> = T extends Result<
  any,
  infer E
>
  ? E
  : any;

export type ErrorTypeIfPresent<
  T extends Result<any, any> | undefined
> = T extends ErrorResult<infer E> ? E : never;

export function hasData<T, E>(
  result: Result<T, E> | undefined
): result is DataResult<T> {
  return result !== undefined && 'data' in result;
}
export function hasError<T, E>(
  result: Result<T, E> | undefined
): result is ErrorResult<E> {
  return result !== undefined && 'error' in result;
}

// Transform data if present or return error unchanged.
export function map<T, E, R>(
  result: Result<T, E>,
  dataMapper: (data: T) => R
): Result<R, E>;

// Transform data if present or return error / undefined unchanged.
export function map<T, E, R>(
  result: Result<T, E> | undefined,
  dataMapper: (data: T) => R
): Result<R, E> | undefined;

// (Implementation of overloaded function. Not exposed.)
export function map<T, E, R>(
  result: Result<T, E> | undefined,
  dataMapper: (data: T) => R
): Result<R, E> | undefined {
  if (result === undefined) return undefined;
  return 'error' in result ? result : { data: dataMapper(result.data) };
}

// Represents a piece of remote info, which may be
// - No info and not loading (initial)
// - No info and loading (fetching)
// - Has info and not loading (completed)
// - Has info and loading (refreshing)
export type Remote<T> = { result?: T; loading: boolean };

export type RemoteResult<T, E = ErrorInfo> = Remote<Result<T, E>>;

// Transform result.data if present or return result.error unchanged.
export function mapResult<T, E, R>(
  remoteResult: RemoteResult<T, E>,
  dataMapper: (data: T) => R
): RemoteResult<R, E> {
  return {
    loading: remoteResult.loading,
    result: map(remoteResult.result, dataMapper),
  };
}

export type DataTypeOfEach<
  T extends ReadonlyArray<Result<any, any> | undefined>
> = {
  [P in keyof T]: T[P] extends Result<any, any> | undefined
    ? DataTypeIfPresent<T[P]>
    : T[P];
};

/**
 * Combine data of the remote results, or return first error encountered.
 *
 * If there are no errors but any result is undefined, return undefined.
 */
export function combineData<
  Arr extends ReadonlyArray<Result<any, any> | undefined>
>(
  ...results: Arr
): Result<DataTypeOfEach<Arr>, ErrorTypeIfPresent<Arr[number]>> | undefined {
  for (const result of results) {
    if (hasError(result)) {
      return result;
    }
  }
  for (const result of results) {
    if (result === undefined) {
      return undefined;
    }
  }

  return {
    data: (results.map(
      result => (result as DataResult<unknown>).data
    ) as unknown) as DataTypeOfEach<Arr>,
  };
}

// Handle missing / data / error cases of a result and return a single value.
export function handle<T, E>(
  result: Result<T, E> | undefined,
  mappers: {
    onNone: () => ReactElement;
    onData: (data: T) => ReactElement;
    onError: (error: E) => ReactElement;
  }
): ReactElement {
  if (result === undefined) {
    return mappers.onNone();
  } else {
    if (hasError(result)) {
      return mappers.onError(result.error);
    } else {
      return mappers.onData(result.data);
    }
  }
}

// Handle all loading / data cases of a remote and return a single value.
export function squash<T, E>(
  remoteResult: RemoteResult<T, E>,
  mappers: {
    onNone: (loading: boolean) => ReactElement;
    onData: (data: T, loading: boolean) => ReactElement;
    onError: (error: E, loading: boolean) => ReactElement;
  }
): ReactElement {
  return handle(remoteResult.result, {
    onNone: () => mappers.onNone(remoteResult.loading),
    onData: data => mappers.onData(data, remoteResult.loading),
    onError: error => mappers.onError(error, remoteResult.loading),
  });
}

// Set parent[key] to newValue unless exising value is deeply equal.
// Can be used to set an immer draft property to a nested external object.
export function replaceIfChanged<Parent, Key extends keyof Parent>(
  parent: Parent,
  key: Key,
  newValue: Parent[Key]
): void {
  const oldValue = isDraft(parent) ? original(parent)![key] : parent[key];
  if (!deepEquals(oldValue, newValue)) {
    parent[key] = newValue;
  }
}
