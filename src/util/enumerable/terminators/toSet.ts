import { Enumerable } from '..';

export function toSet<T>(this: Enumerable<T>): Set<T> {
    let result = new Set<T>();
    let enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        result.add(enumerator.current);
    }

    return result;
}