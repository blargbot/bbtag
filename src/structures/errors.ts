import { IStringToken, ISubtagToken } from './bbtag';
import { SubtagContext } from './context';

export class ChainedError extends Error {
    public readonly innerError?: Error;

    constructor(innerError: Error)
    constructor(message: string, innerError: Error)
    constructor(message: string | Error | undefined, innerError?: Error) {
        if (typeof message !== 'string') {
            innerError = message;
            message = undefined;
        }

        super(message);
        this.innerError = innerError;
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

export class AggregateError extends Error {
    public readonly innerErrors: readonly any[];
    constructor(message?: string, ...innerErrors: any[]) {
        super(message);
        this.innerErrors = innerErrors;
    }
}