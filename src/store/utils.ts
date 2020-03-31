import { isDraft, original } from 'immer';
import deepEquals from 'lodash.isequal';

export interface ErrorInfo {
  message: string;
}

// Represents a piece of remote info, which may be
// - No info and not loading (initial)
// - No info and loading (fetching)
// - Has info and not loading (completed)
// - Has info and loading (refreshing)
export type Remote<T> = { result?: T; loading: boolean };

/* Represents result of a task, either success (with data) or error. */
export type Result<T, E = ErrorInfo> = DataResult<T> | ErrorResult<E>;
export type DataResult<T> = { data: T };
export type ErrorResult<E> = { error: E };

export type RemoteResult<T, E = ErrorInfo> = Remote<Result<T, E>>;

// Type helper to extract the type of T.result.data.
export type DataTypeOf<
  T extends RemoteResult<any, any>
> = T extends RemoteResult<infer D, any> ? D : any;

// Type helper to extract the type of T.result.error.
export type ErrorTypeOf<
  T extends RemoteResult<any, any>
> = T extends RemoteResult<any, infer E> ? E : any;

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
): Result<R, E> {
  return 'error' in result ? result : { data: dataMapper(result.data) };
}

// Transform result.data if present or return result.error unchanged.
export function mapResult<T, E, R>(
  remoteResult: RemoteResult<T, E>,
  dataMapper: (data: T) => R
): RemoteResult<R, E> {
  return {
    loading: remoteResult.loading,
    result:
      remoteResult.result === undefined
        ? undefined
        : map(remoteResult.result, dataMapper),
  };
}

export type DataTypeOfEach<T extends ReadonlyArray<RemoteResult<any, any>>> = {
  [P in keyof T]: T[P] extends RemoteResult<any, any> ? DataTypeOf<T[P]> : T[P];
};

/**
 * Combine result.data of the remote results, or return first error encountered.
 *
 * If there are no errors but any result is undefined, return undefined result.
 */
export function combineData<Arr extends ReadonlyArray<RemoteResult<any, any>>>(
  ...remoteResults: Arr
): RemoteResult<DataTypeOfEach<Arr>, ErrorTypeOf<Arr[number]>> {
  const loading = remoteResults.some(rr => rr.loading);
  for (const remoteResult of remoteResults) {
    if (hasError(remoteResult.result)) {
      return { loading, result: remoteResult.result };
    }
  }
  for (const remoteResult of remoteResults) {
    if (remoteResult.result === undefined) {
      return { loading, result: undefined };
    }
  }

  return {
    loading,
    result: {
      data: (remoteResults.map(
        rr => (rr.result as DataResult<unknown>).data
      ) as unknown) as DataTypeOfEach<Arr>,
    },
  };
}

// Handle all loading / data cases of a remote and return a single value.
export function squash<T, E, R>(
  remoteResult: RemoteResult<T, E>,
  mappers: {
    onNone: (loading: boolean) => R;
    onData: (data: T, loading: boolean) => R;
    onError: (error: E, loading: boolean) => R;
  }
): R {
  if (remoteResult.result === undefined) {
    return mappers.onNone(remoteResult.loading);
  } else {
    if (hasError(remoteResult.result)) {
      return mappers.onError(remoteResult.result.error, remoteResult.loading);
    } else {
      return mappers.onData(remoteResult.result.data, remoteResult.loading);
    }
  }
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
