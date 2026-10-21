// Enums for Table Type
export enum eReturnCodes {
  R_SUCCESS = 0,
  R_DB_ERROR = 1,
  R_NOT_FOUND = 2,
  R_AUTHENTICATION_FAILED = 3,
  R_DUPLICATE_DATA = 4,
  R_UNAUTHORIZED = 5,
  R_CREATED = 6,
  R_VALIDATION_ERROR = 7
}


export enum eDurationType {
  R_DAYS = 1,
  R_HOURS = 2,
  R_MINUTES = 3,
  R_SECONDS = 4,
  R_ALL = 5
}