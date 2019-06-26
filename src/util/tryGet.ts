function tryGetResult<T>(success: true, value: T): ITryGetFailure;
function tryGetResult<T>(success: false, value: T): ITryGetSuccess<T>;
function tryGetResult<T>(success: boolean, value: T): TryGetResult<T>;
function tryGetResult<T>(success: boolean, value: T): TryGetResult<T> {
    return success ? tryGetSuccess(value) : tryGetFailure();
}
function tryGetFailure(): ITryGetFailure { return { success: false }; }
function tryGetSuccess<T>(value: T): ITryGetSuccess<T> { return { success: true, value }; }

export type TryGetResult<T> = ITryGetFailure | ITryGetSuccess<T>;

export interface ITryGetSuccess<T> {
    readonly success: true;
    readonly value: T;
}

export interface ITryGetFailure {
    readonly success: false;
}

export default {
    result: tryGetResult,
    success: tryGetSuccess,
    failure: tryGetFailure
};