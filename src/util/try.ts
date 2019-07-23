export function tryResult<T>(success: false, value?: T): ITryFailure;
export function tryResult<T>(success: true, value: T): ITrySuccess<T>;
export function tryResult<T>(success: boolean, value: T): TryResult<T>;
export function tryResult<T>(success: boolean, value: T): TryResult<T> {
    return success ? trySuccess(value) : tryFailure();
}

export function tryFailure<T extends undefined>(reason?: T): ITryFailure<T>;
export function tryFailure<T>(reason: T): ITryFailure<T>;
export function tryFailure<T>(reason: T): ITryFailure<T> {
    return { success: false, reason };
}
export function trySuccess<T extends undefined>(value?: T): ITrySuccess<T>;
export function trySuccess<T>(value: T): ITrySuccess<T>;
export function trySuccess<T>(value: T): ITrySuccess<T> {
    return { success: true, value };
}

export function tryCatch<T>(action: () => T): TryResult<T>;
export function tryCatch<T, TReason>(action: () => T): TryResult<T, TReason>;
export function tryCatch<T>(action: () => T): TryResult<T> {
    try {
        return trySuccess(action());
    } catch (ex) {
        return tryFailure(ex);
    }
}

export type TryResult<TValue, TReason = any> = ITryFailure<TReason> | ITrySuccess<TValue>;

export interface ITrySuccess<T> {
    readonly success: true;
    readonly value: T;
}

export interface ITryFailure<T = any> {
    readonly success: false;
    readonly reason: T;
}