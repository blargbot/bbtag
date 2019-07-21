import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { predicateFunc, predicateIsFunc } from '../types';

export class WhereEnumerable<T> extends IterableEnumerable<T> {
    public static create<T, S extends T>(this: Enumerable<T>, predicate: predicateIsFunc<T, S>): WhereEnumerable<S>;
    public static create<T>(this: Enumerable<T>, predicate: predicateFunc<T>): WhereEnumerable<T>;
    public static create<T>(this: Enumerable<T>, predicate: predicateFunc<T>): WhereEnumerable<T> {
        return new WhereEnumerable(this, predicate);
    }

    public constructor(source: Enumerable<any>, predicate: predicateIsFunc<any, T>)
    public constructor(source: Enumerable<T>, predicate: predicateFunc<T>)
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