export const functions = {
    blank(): void { },
    never(): never { throw new Error('This function should never have been called'); },
    identity<T>(x: T): T { return x; },
    true(): true { return true; },
    false(): false { return false; },
    always<T>(value: T): () => T { return () => value; },
    deferred<T extends (...args: any[]) => any>(
        createHandler: () => T,
        replaceHandler: (newHandler: T) => void
    ): (...args: Parameters<T>) => ReturnType<T> {
        return function deferred(...args: Parameters<T>): ReturnType<T> {
            const newHandler = createHandler();
            replaceHandler(newHandler);
            return newHandler(...args);
        };
    }
};

export default functions;