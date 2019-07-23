export class AggregateError extends Error {
    public readonly innerErrors: readonly any[];

    constructor(message?: string, ...innerErrors: any[]) {
        super(message);
        this.innerErrors = innerErrors;
    }
}
