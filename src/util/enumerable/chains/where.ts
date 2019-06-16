import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { predicate } from '../types';

export class WhereEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Enumerable<T>, predicate: predicate<T>) {
        super({ [Symbol.iterator]() { return _where(source, predicate); } });
    }

    public static create<T>(this: Enumerable<T>, predicate: predicate<T>): WhereEnumerable<T> {
        return new WhereEnumerable(this, predicate);
    }
}

function* _where<T>(source: Enumerable<T>, predicate: predicate<T>) {
    let index = 0;
    for (const element of source.toIterable()) {
        if (predicate(element, index++)) {
            yield element;
        }
    }
}