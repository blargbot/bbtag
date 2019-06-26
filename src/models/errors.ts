import { IStringToken, ISubtagToken } from './bbtag';

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

    constructor(token: ISubtagToken | IStringToken);
    constructor(message: string, token: ISubtagToken | IStringToken);
    constructor(innerError: Error, token: ISubtagToken | IStringToken);
    constructor(message: string, innerError: Error, token: ISubtagToken | IStringToken);
    constructor(arg1?: any, arg2?: any, arg3?: any) {
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
    }
}

export default {
    notEnoughArgs(context: any, token: ISubtagToken): SubtagError { return new SubtagError(`Not enough arguments`, token); },
    tooManyArgs(context: any, token: ISubtagToken): SubtagError { return new SubtagError(`Too many arguments`, token); },
    types: {
        notNumber(token: IStringToken): SubtagError { return new SubtagError(`Not a number`, token); },
        notArray(token: IStringToken): SubtagError { return new SubtagError(`Not an array`, token); },
        notBool(token: IStringToken): SubtagError { return new SubtagError(`Not a boolean`, token); },
        notOperator(token: ISubtagToken | IStringToken): SubtagError { return new SubtagError(`Invalid operator`, token); }
    }
};