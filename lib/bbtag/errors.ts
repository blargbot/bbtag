import { IStringToken, ISubtagError, ISubtagToken } from '.';
import { ISubtag, SubtagContext } from '../structures';
import { Enumerable } from '../util';

type Validation = Readonly<typeof basicErrors> & { throw: ThrowCollection<typeof basicErrors>; };
type TokenType = ISubtagToken | IStringToken;

type ErrorFunc<T extends any[] = [], R = ISubtagError> = Overload1<T, R> & Overload2<T, R> & Overload3<T, R>;
type ErrorParams<T extends any[] = [], R = ISubtagError> = Parameters<Overload1<T, R> | Overload2<T, R> | Overload3<T, R>>;
type Overload1<T extends any[] = [], R = ISubtagError> = ((args: { context: SubtagContext, token: TokenType }, ...remainder: T) => R);
type Overload2<T extends any[] = [], R = ISubtagError> = ((args: { context: SubtagContext, token: TokenType }, token: TokenType, ...remainder: T) => R);
type Overload3<T extends any[] = [], R = ISubtagError> = ((context: SubtagContext, token: TokenType, ...remainder: T) => R);

type FuncCollection<T> = { readonly [P in keyof T]: FuncCollection<T[P]> | ErrorFunc<any[]> };
type ThrowCollection<T extends FuncCollection<any> | ErrorFunc> =
    T extends FuncCollection<any> ? { readonly [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: infer R) => any ? (...args: R) => never :
    never;

const sampleStringToken: IStringToken = { range: undefined!, subtags: undefined!, format: undefined! };
const sampleSubtagToken: ISubtagToken = { range: undefined!, args: undefined!, name: undefined! };
const tokenSignatures = Enumerable.from([Object.keys(sampleStringToken), Object.keys(sampleSubtagToken)]).select(Enumerable.from).cache();

function isToken(value: any): value is TokenType {
    const signature = Enumerable.from(Object.keys(value));
    return tokenSignatures.any(sig => sig.isDataEqual(signature));
}

function errorBuilder(message: string): ErrorFunc;
function errorBuilder<T extends any[]>(message: (...args: T) => string): ErrorFunc<T>;
function errorBuilder<T extends any[]>(arg: ((...args: T) => string) | string): ErrorFunc<T> {
    const message = typeof arg === 'string' ? (..._: T) => arg : arg;
    return function error(...args: ErrorParams<T>): ReturnType<ErrorFunc<T>> {
        const [context, token, remaining] =
            args[0] instanceof SubtagContext
                ? [args[0], args[1], args.slice(2) as T]
                : isToken(args[1])
                    ? [args[0].context, args[1], args.slice(1) as T]
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
        unknownHandler: errorBuilder((subtag: ISubtag<any>) => `Missing handler for execution of subtag {${subtag.toString()}}`)
    }
};

export const errors: Validation = {
    ...basicErrors,
    throw: cloneAndThrow(basicErrors)
};

export default errors;