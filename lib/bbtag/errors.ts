import { IStringToken, ISubtagError, ISubtagToken } from '.';
import { SubtagContext } from '../structures';

type Validation = Readonly<typeof basicErrors> & { throw: ThrowCollection<typeof basicErrors>; };
type TokenType = ISubtagToken | IStringToken;

type ErrorFunc<T extends any[] = [], R = ISubtagError> = Overload1<T, R> & Overload2<T, R>;
type ErrorParams<T extends any[] = [], R = ISubtagError> = Parameters<Overload1<T, R>> | Parameters<Overload2<T, R>>;
type Overload1<T extends any[] = [], R = ISubtagError> = ((args: { context: SubtagContext, token: TokenType }, ...remainder: T) => R);
type Overload2<T extends any[] = [], R = ISubtagError> = ((context: SubtagContext, token: TokenType, ...remainder: T) => R);

type FuncCollection<T> = { readonly [P in keyof T]: FuncCollection<T[P]> | ErrorFunc<any[]> };
type ThrowCollection<T extends FuncCollection<any> | ErrorFunc> =
    T extends FuncCollection<any> ? { readonly [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: infer R) => any ? (...args: R) => never :
    never;

function errorMessage(message: string): ErrorFunc;
function errorMessage<T extends any[]>(message: (...args: T) => string): ErrorFunc<T>;
function errorMessage<T extends any[]>(arg: ((...args: T) => string) | string): ErrorFunc<T> {
    const message = typeof arg === 'string' ? (..._: T) => arg : arg;
    return function error(...args: ErrorParams<T>): ReturnType<ErrorFunc<T>> {
        const [context, token, remaining] = args[0] instanceof SubtagContext
            ? [args[0], args[1], args.slice(2) as T]
            : [args[0].context, args[0].token, args.slice(1) as T];
        return context.error(token, message(...remaining));
    } as any;
}

function cloneAndThrow<T extends FuncCollection<T>>(source: T, ...ignores: string[]): ThrowCollection<T> {
    const result: { [key: string]: any } = {};

    for (const key in source) {
        if (ignores.indexOf(key) === -1 && source.hasOwnProperty(key)) {
            const value = source[key] as any;
            switch (typeof source[key]) {
                case 'object':
                    result[key] = cloneAndThrow(value);
                    break;
                case 'function':
                    result[key] = (...args: any[]) => {
                        throw value(...args);
                    };
                    break;
            }
        }
    }

    return result as ThrowCollection<T>;
}

const basicErrors = {
    notEnoughArgs: errorMessage(`Not enough arguments`),
    tooManyArgs: errorMessage(`Too many arguments`),
    serverError: errorMessage(`Internal Server Error`),
    subtagUnknown: errorMessage((name: string) => `Unknown subtag ${name}`),
    types: {
        notNumber: errorMessage(`Not a number`),
        notArray: errorMessage(`Not an array`),
        notBool: errorMessage(`Not a boolean`),
        notOperator: errorMessage(`Invalid operator`),
        array: {
            outOfBounds: errorMessage(`Index out of range`)
        }
    }
};

export const errors: Validation = {
    ...basicErrors,
    throw: cloneAndThrow(basicErrors)
};

export default errors;