import { IStringToken, ISubtagToken } from '../language';
import { ArgumentCollection } from './argumentCollection';
import { ExecutionContext } from './context';
import { SubtagError } from './errors';

type TokenType = ISubtagToken | IStringToken;
type EXC = ExecutionContext;
type AC<T extends EXC> = ArgumentCollection<T>;

export const validation = {
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
    }
};