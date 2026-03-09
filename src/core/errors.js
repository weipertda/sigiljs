export class SigilValidationError extends Error {
  constructor(message, path, expected, actual) {
    super(message);
    this.name = 'SigilValidationError';
    this.code = 'SIGIL_VALIDATION_FAILED';
    this.path = path;
    this.expected = expected;
    this.actual = actual;
  }
}
