import { Enumerable } from '..';
import { predicate } from '../types'

export function all<T>(this: Enumerable<T>, predicate: predicate<T>): boolean {
    let index = 0;
    let enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        if (!predicate(enumerator.current, index++)) {
            return false;
        }
    }

    return true;
}