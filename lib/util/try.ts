// tslint:disable-next-line: no-namespace
export namespace Try {
    export type Result<T, R = any> = ISuccess<T> | IFailure<R>;
    export interface ISuccess<T> {
        readonly success: true;
        readonly value: T;
    }
    export interface IFailure<T> {
        readonly success: false;
        readonly reason: T;
    }

    export function from(success: false): IFailure<undefined>;
    export function from<T>(success: true, value: T): ISuccess<T>;
    export function from<R>(success: false, reason: R): IFailure<R>;
    export function from<T, R>(success: boolean, value: T, reason: R): Result<T, R>;
    export function from<T, R>(...args: [true, T] | [false] | [false, R] | [boolean, T, R]): Result<T, R> {
        switch (args.length) {
            case 1:
            case 3: return { success: false, reason: args[2] as R };
            case 2: switch (args[0]) {
                case true: return { success: true, value: args[1] };
                case false: return { success: false, reason: args[1] };
            }
        }
        throw new Error('Invalid arguments provided');
    }

    export function failure(): IFailure<undefined>;
    export function failure<R>(reason: R): IFailure<R>;
    export function failure<R>(reason: R = undefined!): IFailure<R> {
        return from(false, reason);
    }

    export function success(): ISuccess<undefined>;
    export function success<R>(reason: R): ISuccess<R>;
    export function success<R>(reason: R = undefined!): ISuccess<R> {
        return from(true, reason);
    }

    export const failed = failure();
}

export default Try;