import { ISubtag } from '../structures';
import { ErrorFunc, ErrorParams } from './types';

type Validation = typeof basicErrors & { throw: ThrowCollection<typeof basicErrors>; };

type FuncCollection<T> = { [P in keyof T]: FuncCollection<T[P]> | ErrorFunc<any[]> };
type ThrowCollection<T extends FuncCollection<any> | ErrorFunc> =
    T extends FuncCollection<any> ? { [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: infer R) => any ? (...args: R) => never :
    never;

function errorBuilder(message: string): ErrorFunc;
function errorBuilder<T extends any[]>(message: (...args: T) => string): ErrorFunc<T>;
function errorBuilder<T extends any[]>(arg: ((...args: T) => string) | string): ErrorFunc<T> {
    const message = typeof arg === 'string' ? (..._: T) => arg : arg;
    return function error(...args: ErrorParams<T>): ReturnType<ErrorFunc<T>> {
        const [context, token, remaining] =
            'context' in args[0] ?
                typeof args[1] === 'object' && 'range' in args[1] ?
                    [args[0].context, args[1], args.slice(2) as T] :
                    [args[0].context, args[0].token, args.slice(1) as T] :
                [args[0], args[1], args.slice(2) as T];
        return context.error(token, message(...remaining));
    } as any;
}

function cloneAndThrow<T extends FuncCollection<T>>(source: T): ThrowCollection<T> {
    const result: Partial<ThrowCollection<T>> = {};

    // tslint:disable-next-line: forin
    for (const key of Object.keys(source) as Array<keyof T & keyof typeof result>) {
        const value = source[key] as any;
        switch (typeof source[key]) {
            case 'object':
                result[key] = cloneAndThrow(value) as typeof result[typeof key];
                break;
            case 'function':
                result[key] = ((...args: any[]) => {
                    throw value(...args);
                }) as typeof result[typeof key];
                break;
        }
    }

    return result as ThrowCollection<T>;
}

const basicErrors = {
    notEnoughArgs: errorBuilder(`Not enough arguments`),
    tooManyArgs: errorBuilder(`Too many arguments`),
    types: {
        notNumber: errorBuilder(`Not a number`),
        notArray: errorBuilder(`Not an array`),
        notBool: errorBuilder(`Not a boolean`),
        notOperator: errorBuilder(`Invalid operator`),
        array: {
            outOfBounds: errorBuilder(`Index out of range`)
        }
    },
    system: {
        internal: errorBuilder(`Internal Server Error`),
        unknownSubtag: errorBuilder((name: string) => `Unknown subtag ${name}`),
        unknownHandler: errorBuilder((subtag: ISubtag<any>) => `Missing handler for execution of subtag ${subtag}`)
    }
};

export const errors: Validation = {
    ...basicErrors,
    throw: cloneAndThrow(basicErrors)
};

export default errors;