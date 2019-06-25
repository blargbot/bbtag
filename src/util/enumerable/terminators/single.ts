import { Enumerable } from '..';
import { predicateFunc } from '../types';

export function single<T>(this: Enumerable<T>, predicate?: predicateFunc<T>, defaultValue?: () => T): T {
    if (defaultValue === undefined) {
        defaultValue = () => { throw new Error('Sequence contained no elements'); };
    }

    const source = predicate === undefined ? this : this.where(predicate);
    const enumerator = source.getEnumerator();

    if (!enumerator.moveNext()) {
        return defaultValue();
    }

    const result = enumerator.current;

    if (enumerator.moveNext()) {
        throw new Error('Sequence contained more than 1 element');
    }

    return result;
}