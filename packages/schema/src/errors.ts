import type { Primitive } from "zod/v3";
import type { Maybe } from "./utils";

export enum Err {
  ACCESS_DENIED = "ACCESS_DENIED",
  ACCOUNT_EXPIRED = "ACCOUNT_EXPIRED",
  ADMIN_CANNOT_HAVE_ROLE = "ADMIN_CANNOT_HAVE_ROLE",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  ALREADY_ASSIGNED = "ALREADY_ASSIGNED",
  BOT_CHECK_FAILED = "BOT_CHECK_FAILED",
  CANNOT_CHANGE_PASSWORD_YET = "CANNOT_CHANGE_PASSWORD_YET",
  CANNOT_REUSE_PASSWORD_HISTORY = "CANNOT_REUSE_PASSWORD_HISTORY",
  CANNOT_USE_SAME_PASSWORD = "CANNOT_USE_SAME_PASSWORD",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  FIELD_REQUIRED = "FIELD_REQUIRED",
  FILE_REQUIRED = "FILE_REQUIRED",
  INVALID_FILE = "INVALID_FILE",
  INVALID_LOGIN = "INVALID_LOGIN",
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_NAME = "INVALID_NAME",
  INCORRECT_OTP = "INCORRECT_OTP",
  LOGIN_REQUIRED = "LOGIN_REQUIRED",
  MFA_ALREADY_SET = "MFA_ALREADY_SET",
  MISSING_SHEET = "MISSING_SHEET",
  MISSING_COLUMN = "MISSING_COLUMN",
  INCOMPLETE_ROW = "INCOMPLETE_ROW",
  NOT_FOUND = "NOT_FOUND",
  OLD_PASSWORD_IS_INCORRECT = "OLD_PASSWORD_IS_INCORRECT",
  PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT",
  RESET_LINK_INVALID = "RESET_LINK_INVALID",
  SESSION_CHANGED_DEVICE = "SESSION_CHANGED_DEVICE",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  STATUS_ALREADY_CHANGED = "STATUS_ALREADY_CHANGED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  VALUE_UNCHANGED = "VALUE_UNCHANGED",
  VENDOR_CANNOT_BE_STAFF = "VENDOR_CANNOT_BE_STAFF",
  WAIT_BEFORE_RETRYING = "WAIT_BEFORE_RETRYING",
  INTENAL_SERVER_ERROR = "INTENAL_SERVER_ERROR",
}

const non400: Partial<Record<Err, 401 | 403 | 404 | 429 | 500>> = {
  [Err.LOGIN_REQUIRED]: 401,
  [Err.ACCOUNT_EXPIRED]: 401,
  [Err.SESSION_CHANGED_DEVICE]: 401,
  [Err.SESSION_EXPIRED]: 401,
  [Err.ACCESS_DENIED]: 403,
  [Err.NOT_FOUND]: 404,
  [Err.CANNOT_CHANGE_PASSWORD_YET]: 429,
  [Err.WAIT_BEFORE_RETRYING]: 429,
  [Err.INTENAL_SERVER_ERROR]: 500,
};

export class ApiError extends Error {
  readonly status;
  readonly key;

  constructor(
    readonly error: Err,
    readonly param?: Omit<Param, symbol>,
  ) {
    super(Err[error]);
    this.key = Err[error];
    this.status = non400[error] || 400;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type Param = Omit<Primitive, symbol>;

export function bad(error: Err, param?: Param): never {
  throw new ApiError(error, param);
}

export function mustHave<T>(
  value: Maybe<T>,
  param?: Omit<Param, symbol>,
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
