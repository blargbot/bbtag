import { IStringToken, ISubtagError, ISubtagToken } from '../language';
import { ArgumentCollection } from './argumentCollection';
import { ExecutionContext } from './context';

type TokenType = ISubtagToken | IStringToken;
type EXC = ExecutionContext;
type AC<T extends EXC> = ArgumentCollection<T>;

type FuncCollection<T> = { readonly [P in keyof T]: FuncCollection<T[P]> | ((...args: any[]) => ISubtagError) };
type ThrowCollection<T extends FuncCollection<any> | ((...args: any[]) => ISubtagError)> =
    T extends FuncCollection<any> ? { readonly [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: any[]) => ISubtagError ? (...args: Parameters<T>) => never :
    never;

interface IValidation {
    throw: ThrowCollection<Omit<IValidation, 'throw'>>;
    types: {
        array: {
            outOfRange<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
        };
        notNumber<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
        notArray<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
        notBool<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
        notOperator<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
    };
    notEnoughArgs<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
    tooManyArgs<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError;
}

export const validation: Readonly<IValidation> = {
    notEnoughArgs<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not enough arguments`); },
    tooManyArgs<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Too many arguments`); },
    types: {
        notNumber<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not a number`); },
        notArray<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not an array`); },
        notBool<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Not a boolean`); },
        notOperator<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Invalid operator`); },
        array: {
            outOfRange<T extends EXC>(args: AC<T>, token?: TokenType): ISubtagError { return args.context.error(token || args.token, `Index out of range`); }
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

(validation as IValidation).throw = cloneAndThrow(validation, 'throw');