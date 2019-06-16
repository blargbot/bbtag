import { Enumerable } from '..';
import { predicate } from '../types'

export function any<T>(this: Enumerable<T>, predicate?: predicate<T>): boolean {
    if (predicate === undefined) {
        predicate = () => true;
    }

    let index = 0;
    let enumerator = this.getEnumerator();

    while (enumerator.moveNext()) {
        if (predicate(enumerator.current, index++)) {
            return true;
        }
    }

    return false;
}