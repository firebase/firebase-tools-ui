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
