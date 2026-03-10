/**
 * Thrown by `assert()` when a value fails validation.
 *
 * Properties:
 *   - message  — human-readable description of the failure
 *   - code     — always "SIGIL_VALIDATION_FAILED" (machine-readable)
 *   - path     — array of keys to the failing property (e.g. ["user", "email"])
 *   - expected — type string that was expected
 *   - actual   — type string that was received
 */
export class SigilValidationError extends Error {
  constructor(message, path, expected, actual) {
    super(message);
    this.name = 'SigilValidationError';
    this.code = 'SIGIL_VALIDATION_FAILED';
    this.path = path;
    this.expected = expected;
    this.actual = actual;

    // Omit the constructor frame from V8/Bun stack traces
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SigilValidationError);
    }
  }

  /** Consistent devtools / console.log labeling */
  get [Symbol.toStringTag]() {
    return 'SigilValidationError';
  }
}
