import { Enumerable } from '..';
import { predicateFunc } from '../types';

export function any<T>(this: Enumerable<T>, predicate?: predicateFunc<T>): boolean {
    if (predicate === undefined) {
        predicate = () => true;
    }

    let index = 0;
    const enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        if (predicate(enumerator.current, index++)) {
            return true;
        }
    }

    return false;
}