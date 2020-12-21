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

import { RMWCProvider } from '@rmwc/provider';
import {
  act,
  fireEvent,
  render,
  waitForElement,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
import { FormContextValues, UseFormOptions, useForm } from 'react-hook-form';

export function delay(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}

/**
 * Render a component and wait for some async DOM changes on init.
 * This serves as a last resort to silence warnings of changing the DOM outside
 * act(...), e.g. for RMWC <Tab>s.
 *
 * - For Dialogs, use renderDialog or waitForDialogsToOpen/Close instead.
 * - To test components that change state based on Promises, use makeDeferred().
 */

/**
 * Wait for MDC dialogs to be fully open, so no DOM changes happen outside
 * our control and trigger warnings of not wrapped in act(...) etc.
 */
export async function waitForDialogsToOpen(container: ParentNode = document) {
  // TODO: Change to waitFor once we migrate to react-testing-library@10.
  await waitForElement(() =>
    container.querySelector('.mdc-dialog--open:not(.mdc-dialog--opening)')
  );
}

/**
 * Wait for MDC dialogs to be fully closed, so no DOM changes happen outside
 * our control and trigger warnings of not wrapped in act(...) etc.
 */
export async function waitForDialogsToClose(container: ParentNode = document) {
  // TODO: Change to waitFor once we migrate to react-testing-library@10.
  await waitForElementToBeRemoved(() =>
    document.querySelector('.mdc-dialog--closing')
  );
}

/**
 * A controlled wrapper for a Promise which is useful for tests.
 *
 * Usage:
 *
 * ```
 * const deferred = makeDeferred();
 * const objectUnderTest = getObjectUnderTest(deferred.promise);
 * // assertions about how objectUnderTest behaves in the pending state...
 * await act(() => deferred.resolve(value));
 * // assertions about how objectUnderTest behaves in the fulfilled state...
 * ```
 *
 * In another test, you can use reject instead and test for rejected state.
 */
export interface Deferred<T> {
  /** The promise being controlled. Will be resolved when resolve is called and
   * will be rejected when reject is called.
   */
  readonly promise: Promise<T>;

  /**
   * A helper function to resolve the controlled promise. For convenience, this
   * function also returns another promise that is always FULFILLED after the
   * controlled promise is resolved.
   *
   * Example Usage: `await act(() => deferred.resolve(x));`.
   */
  readonly resolve: (value?: T | PromiseLike<T>) => Promise<void>;

  /**
   * A helper function to reject the controlled promise. For convenience, this
   * function also returns another promise that is always FULFILLED after the
   * controlled promise is rejected.
   * This is just syntatic sugar for `deferred.resolve(Promise.reject(reason))`
   *
   * Example Usage: `await act(() => deferred.resolve(x));`.
   */
  readonly reject: (reason?: any) => Promise<void>;
}

export function makeDeferred<T>(): Deferred<T> {
  let resolve: (value?: T | PromiseLike<T>) => void;
  let isResolved = false;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return {
    promise,
    resolve(value) {
      if (isResolved) {
        fail(
          'Cannot resolve Deferred since it is already resolved! There is ' +
            'very likely a mistake in the test that calls resolve/reject twice.'
        );
      }
      isResolved = true;
      resolve(value);
      return promise.then(
        () => undefined,
        () => undefined
      );
    },
    reject(error) {
      return this.resolve(Promise.reject(error));
    },
  };
}

/**
 * Renders a component wrapped with react hook form, and expose helpers that simplify testing.
 *
 * Component is expected to receive resulting form methods as props.
 */
export const wrapWithForm = <P, T, F = UseFormOptions<T>>(
  Control: React.FC<FormContextValues<T> & P>,
  options: F,
  props: P
) => {
  const submit = jest.fn();
  const FormWrapper = () => {
    const form = useForm<T>(options);

    return (
      // Ripples cause "not wrapped in act()" warning.
      <RMWCProvider ripple={false}>
        <form data-testid="form" onSubmit={form.handleSubmit(submit)}>
          <Control {...form} {...props} />
        </form>
      </RMWCProvider>
    );
  };

  const methods = render(<FormWrapper />);

  const triggerValidation = async () => {
    await act(async () => {
      fireEvent.submit(methods.getByTestId('form'));
    });
  };

  return { ...methods, triggerValidation, submit };
};
