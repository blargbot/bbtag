import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { predicateFunc } from '../types';

export class WhereEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(this: Enumerable<T>, predicate: predicateFunc<T>): WhereEnumerable<T> {
        return new WhereEnumerable(this, predicate);
    }

    public constructor(source: Enumerable<T>, predicate: predicateFunc<T>) {
        super(() => _where(source, predicate));
    }
}

function* _where<T>(source: Enumerable<T>, predicate: predicateFunc<T>): IterableIterator<T> {
    let index = 0;
    for (const element of source) {
        if (predicate(element, index++)) {
            yield element;
        }
    }
}