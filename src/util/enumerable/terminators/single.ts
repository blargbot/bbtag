import { Enumerable } from '..';
import { predicate } from '../types'

export function single<T>(this: Enumerable<T>, predicate?: predicate<T>, defaultValue?: () => T): T {
    if (defaultValue === undefined) {
        defaultValue = () => { throw new Error('Sequence contained no elements'); }
    }

    let source = predicate === undefined ? this : this.where(predicate);
    let enumerator = source.getEnumerator();

    if (!enumerator.moveNext()) {
        return defaultValue();
    }

    let result = enumerator.current;

    if (enumerator.moveNext()) {
        throw new Error('Sequence contained more than 1 element');
    }

    return result;
}