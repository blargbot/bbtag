export class ChainedError extends Error {
    public readonly innerError: Error;

    constructor(innerError: Error);
    constructor(message: string, innerError: Error);
    constructor(arg1: string | Error, arg2?: Error) {
        if (typeof arg1 === 'string') {
            super(arg1);
            this.innerError = arg2!;
        } else {
            super();
            this.innerError = arg1;
        }
    }
}