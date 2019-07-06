import { IStringToken, ISubtagToken } from '../language';
import { SubtagContext } from './context';

export class ChainedError extends Error {
    public readonly innerError?: any;

    constructor(message?: string, innerError?: any) {
        super(message);
        this.innerError = innerError;
    }
}

export class AggregateError extends Error {
    public readonly innerErrors: readonly any[];

    constructor(message?: string, ...innerErrors: any[]) {
        super(message);
        this.innerErrors = innerErrors;
    }
}

export class SubtagError extends ChainedError {
    public readonly token: ISubtagToken | IStringToken;
    public readonly context: SubtagContext;

    constructor(context: SubtagContext, token: ISubtagToken | IStringToken, message?: string, innerError?: any) {
        super(message, innerError);
        this.context = context;
        this.token = token;
    }
}
