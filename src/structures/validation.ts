import { IStringToken, ISubtagToken } from './bbtag';
import { ExecutionContext } from './context';
import { ArgumentCollection } from './argumentCollection';
import { SubtagError } from './errors';

type TokenType = ISubtagToken | IStringToken;
type EXC = ExecutionContext;
type AC<T extends EXC> = ArgumentCollection<T>;

export default {
    notEnoughArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Not enough arguments`, token || args.token); },
    tooManyArgs<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Too many arguments`, token || args.token); },
    types: {
        notNumber<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Not a number`, token || args.token); },
        notArray<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Not an array`, token || args.token); },
        notBool<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Not a boolean`, token || args.token); },
        notOperator<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Invalid operator`, token || args.token); },
        array: {
            outOfRange<T extends EXC>(args: AC<T>, token?: TokenType): SubtagError { return args.context.error(`Index out of range`, token || args.token); }
        }
    }
};