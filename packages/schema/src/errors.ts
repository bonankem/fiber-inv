import type { Primitive } from "zod/v3";
import type { Maybe } from "./utils";

export enum Err {
  ACCESS_DENIED,
  ACCOUNT_EXPIRED,
  ADMIN_CANNOT_HAVE_ROLE,
  ALREADY_EXISTS,
  BOT_CHECK_FAILED,
  CANNOT_CHANGE_PASSWORD_YET,
  CANNOT_REUSE_PASSWORD_HISTORY,
  CANNOT_USE_SAME_PASSWORD,
  FIELD_REQUIRED,
  FILE_REQUIRED,
  INVALID_FILE,
  INVALID_LOGIN,
  INVALID_TOKEN,
  INCORRECT_OTP,
  LOGIN_REQUIRED,
  MISSING_COLUMN,
  INCOMPLETE_ROW,
  NOT_FOUND,
  OLD_PASSWORD_IS_INCORRECT,
  PASSWORD_TOO_SHORT,
  RESET_LINK_INVALID,
  SESSION_CHANGED_DEVICE,
  SESSION_EXPIRED,
  STATUS_ALREADY_CHANGED,
  VALIDATION_ERROR,
  VALUE_UNCHANGED,
  VENDOR_CANNOT_BE_STAFF,
  WAIT_BEFORE_RETRYING,
}

const non400: Partial<Record<Err, 401 | 403 | 404 | 429>> = {
  [Err.LOGIN_REQUIRED]: 401,
  [Err.ACCOUNT_EXPIRED]: 401,
  [Err.SESSION_CHANGED_DEVICE]: 401,
  [Err.SESSION_EXPIRED]: 401,
  [Err.ACCESS_DENIED]: 403,
  [Err.NOT_FOUND]: 404,
  [Err.CANNOT_CHANGE_PASSWORD_YET]: 429,
  [Err.WAIT_BEFORE_RETRYING]: 429,
};

export class ApiError extends Error {
  readonly status;
  readonly key;

  constructor(
    readonly error: Err,
    readonly param?: Primitive,
  ) {
    super(Err[error]);
    this.key = Err[error];
    this.status = non400[error] || 400;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function bad(error: Err, param?: Primitive): never {
  throw new ApiError(error, param);
}

export function mustHave<T>(
  value: Maybe<T>,
  param?: Primitive,
  error: Err = Err.FIELD_REQUIRED,
): asserts value {
  if (!value) throw new ApiError(error, param);
}

export function mustHaveFields<
  K extends string,
  O extends { [key in K]?: unknown },
>(
  obj: O,
  ...keys: K[]
): asserts obj is O & { [key in K]: NonNullable<O[key]> } {
  for (const key of keys) mustHave(obj[key], key);
}
