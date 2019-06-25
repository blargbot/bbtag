import { Enumerable } from '..';

export function toSet<T>(this: Enumerable<T>): Set<T> {
    const result = new Set<T>();
    const enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        result.add(enumerator.current);
    }

    return result;
}