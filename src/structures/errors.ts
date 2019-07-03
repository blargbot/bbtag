import { IStringToken, ISubtagToken } from './bbtag';
import { SubtagContext, ExecutionContext } from './context';
import { ArgumentCollection } from './argumentCollection';

export class ChainedError extends Error {
    public readonly innerError?: Error;

    constructor();
    constructor(message: string);
    constructor(innerError: Error);
    constructor(message: string, innerError: Error);
    constructor(arg1?: any, arg2?: any) {
        switch (typeof arg1) {
            case 'string':
                break;
            case 'object':
                arg2 = arg1;
                arg1 = undefined;
                break;
        }

        if (arg1 === undefined && arg2 !== undefined) {
            arg1 = arg2.message;
        }

        super(arg1);
        this.innerError = arg2;
    }
}

export class SubtagError extends ChainedError {
    public readonly token: ISubtagToken | IStringToken;
    public readonly context: SubtagContext;

    constructor(context: SubtagContext, token: ISubtagToken | IStringToken);
    constructor(context: SubtagContext, message: string, token: ISubtagToken | IStringToken);
    constructor(context: SubtagContext, innerError: Error, token: ISubtagToken | IStringToken);
    constructor(context: SubtagContext, message: string, innerError: Error, token: ISubtagToken | IStringToken);
    constructor(context: SubtagContext, arg1?: any, arg2?: any, arg3?: any) {
        switch (typeof arg1) {
            case 'string':
                break;
            case 'object':
                arg3 = arg2;
                arg2 = arg1;
                arg1 = undefined;
                break;
        }
        if (!(arg2 instanceof Error)) {
            arg3 = arg2;
            arg2 = undefined;
        }

        super(arg1!, arg2!);
        this.token = arg3!;
        this.context = context;
    }
}

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