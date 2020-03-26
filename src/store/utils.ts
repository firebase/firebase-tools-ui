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

const ownProp = Object.prototype.hasOwnProperty;

export function hasData<T, E>(
  result: Result<T, E> | undefined
): result is DataResult<T> {
  return result !== undefined && ownProp.call(result, 'data');
}
export function hasError<T, E>(
  result: Result<T, E> | undefined
): result is ErrorResult<E> {
  return result !== undefined && ownProp.call(result, 'error');
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

/**
 * Combine result.data of two remote results, or return first error encountered.
 *
 * No data is returned if either result is undefined.
 * TODO: Overloads with more elements, if needed.
 */
export function combineData<T1, T2, E>([remoteResult1, remoteResult2]: [
  RemoteResult<T1, E>,
  RemoteResult<T2, E>
]): RemoteResult<[T1, T2], E> {
  return {
    loading: remoteResult1.loading || remoteResult2.loading,
    result:
      remoteResult1.result === undefined || remoteResult2.result === undefined
        ? undefined
        : hasError(remoteResult1.result)
        ? remoteResult1.result
        : hasError(remoteResult2.result)
        ? remoteResult2.result
        : { data: [remoteResult1.result.data, remoteResult2.result.data] },
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
