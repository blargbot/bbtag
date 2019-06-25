import { Enumerable } from '..';
import { predicateFunc } from '../types';

export function all<T>(this: Enumerable<T>, predicate: predicateFunc<T>): boolean {
    let index = 0;
    const enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        if (!predicate(enumerator.current, index++)) {
            return false;
        }
    }

    return true;
}