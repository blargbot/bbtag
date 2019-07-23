import { Enumerable } from '..';
import { predicateFunc } from '../types';

export function first<T>(this: Enumerable<T>, predicate?: predicateFunc<T>, defaultValue?: () => T): T {
    if (defaultValue === undefined) {
        defaultValue = () => { throw new Error('Sequence contained no elements'); };
    }

    const source = predicate === undefined ? this : this.where(predicate);
    const enumerator = source.getEnumerator();

    if (!enumerator.moveNext()) {
        return defaultValue();
    }

    return enumerator.current;
}