/**
 * Thrown when trying to use unsafe integers.
 *
 * These require explicit conversions first.
 */
export class UnsafeIntegerError extends Error { }

/**
 * Thrown when, for example trying to add USD to YEN
 */
export class IncompatibleCurrencyError extends Error { }

