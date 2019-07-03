export function resultOf<T>(func: () => T): any {
    try {
        return func();
    } catch (ex) {
        return ex;
    }
}