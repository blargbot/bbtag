import { IStringToken, ISubtagError, ISubtagToken } from '.';
import { SubtagContext } from '../structures';

// tslint:disable-next-line: interface-over-type-literal
type AC = { context: SubtagContext, token: TokenType };
type TokenType = ISubtagToken | IStringToken;

type FuncCollection<T> = { readonly [P in keyof T]: FuncCollection<T[P]> | ((...args: any[]) => ISubtagError) };
type ThrowCollection<T extends FuncCollection<any> | ((...args: any[]) => ISubtagError)> =
    T extends FuncCollection<any> ? { readonly [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: any[]) => ISubtagError ? (...args: Parameters<T>) => never :
    never;

interface IValidation {
    throw: ThrowCollection<Omit<IValidation, 'throw'>>;
    types: {
        array: {
            outOfRange(args: AC, token?: TokenType): ISubtagError;
        };
        notNumber(args: AC, token?: TokenType): ISubtagError;
        notArray(args: AC, token?: TokenType): ISubtagError;
        notBool(args: AC, token?: TokenType): ISubtagError;
        notOperator(args: AC, token?: TokenType): ISubtagError;
    };
    notEnoughArgs(args: AC, token?: TokenType): ISubtagError;
    tooManyArgs(args: AC, token?: TokenType): ISubtagError;
}

export const errors: Readonly<IValidation> = {
    notEnoughArgs(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not enough arguments`); },
    tooManyArgs(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Too many arguments`); },
    types: {
        notNumber(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not a number`); },
        notArray(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not an array`); },
        notBool(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not a boolean`); },
        notOperator(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Invalid operator`); },
        array: {
            outOfRange(args: AC, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Index out of range`); }
        }
    },
    throw: undefined!
};

function cloneAndThrow<T extends FuncCollection<T>>(source: T, ...ignores: string[]): any {
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

    return result;
}

(errors as IValidation).throw = cloneAndThrow(errors, 'throw');

export default errors;