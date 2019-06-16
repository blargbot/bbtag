import { Enumerable } from '..';
import { predicate } from '../types'

export function first<T>(this: Enumerable<T>, predicate?: predicate<T>, defaultValue?: () => T): T {
    if (defaultValue === undefined) {
        defaultValue = () => { throw new Error('Sequence contained no elements'); }
    }

    let source = predicate === undefined ? this : this.where(predicate);
    let enumerator = source.getEnumerator();

    if (!enumerator.moveNext()) {
        return defaultValue();
    }

    return enumerator.current;
}