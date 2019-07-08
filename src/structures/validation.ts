import { IStringToken, ISubtagToken } from '../language';
import { Enumerable } from '../util';
import { ArgumentCollection } from './argumentCollection';
import { ExecutionContext } from './context';
import { SubtagError } from './errors';

type TokenType = ISubtagToken | IStringToken;
type EXC = ExecutionContext;
type AC<T extends EXC> = ArgumentCollection<T>;

type FuncCollection<T> = { readonly [P in keyof T]: FuncCollection<T[P]> | ((...args: any[]) => SubtagError) };
type ThrowCollection<T extends FuncCollection<any> | ((...args: any[]) => SubtagError)> =
    T extends FuncCollection<any> ? { readonly [P in keyof T]: ThrowCollection<T[P]> } :
    T extends (...args: any[]) => SubtagError ? (...args: Parameters<T>) => never :
    never;

interface IValidation {
    throw: ThrowCollection<Omit<IValidation, 'throw'>>;
    types: {
        array: {
            outOfRange<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
        };
        notNumber<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
        notArray<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
        notBool<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
        notOperator<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
    };
    notEnoughArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
    tooManyArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError;
}

export const validation: Readonly<IValidation> = {
    notEnoughArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Not enough arguments`); },
    tooManyArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Too many arguments`); },
    types: {
        notNumber<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Not a number`); },
        notArray<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Not an array`); },
        notBool<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Not a boolean`); },
        notOperator<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Invalid operator`); },
        array: {
            outOfRange<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(token || args.token, `Index out of range`); }
        }
    },
    throw: undefined!
};

function cloneAndThrow(source: { [key: string]: any }, ...ignores: string[]): any {
    const result: { [key: string]: any } = {};

    for (const key of Enumerable.from(Object.keys(source)).except(ignores)) {
        switch (typeof source[key]) {
            case 'object':
                result[key] = cloneAndThrow(source[key]);
                break;
            case 'function':
                result[key] = (...args: any[]) => {
                    throw source[key](...args);
                };
                break;
        }
    }

    return result;
}

(validation as IValidation).throw = cloneAndThrow(validation, 'throw');