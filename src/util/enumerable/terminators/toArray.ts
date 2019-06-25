import { Enumerable } from '..';

export function toArray<T>(this: Enumerable<T>): T[] {
    const result = [];
    const enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        result.push(enumerator.current);
    }

    return result;
}