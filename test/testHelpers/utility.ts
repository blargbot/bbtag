import { Awaitable } from '../../src/util';

export function resultOf<T>(func: () => T): any {
    try {
        return func();
    } catch (ex) {
        return ex;
    }
}

export async function resultOfAsync<T>(func: () => Awaitable<T>): Promise<any> {
    try {
        return await func();
    } catch (ex) {
        return ex;
    }
}