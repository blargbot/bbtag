import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { comparerFunc } from '../types';

export class OrderEnumerable<TSource> extends IterableEnumerable<TSource> {
    public static sort<TS>(this: Enumerable<TS>, comparer?: comparerFunc<TS>): OrderEnumerable<TS> {
        return new OrderEnumerable(this, comparer || defaultComparer);
    }

    public static orderBy<TS, TK>(
        this: Enumerable<TS>,
        selector: (source: TS) => TK,
        descending: boolean = false,
        comparer?: comparerFunc<TK>): OrderEnumerable<TS> {
        const direction = descending ? -1 : 1;
        comparer = comparer || defaultComparer;
        return this.sort((left, right) => direction * comparer!(selector(left), selector(right)));
    }

    public constructor(source: Enumerable<TSource>, comparer: comparerFunc<TSource>) {
        const iterable = source.toIterable();
        if (iterable instanceof Array) {
            super(iterable.sort(comparer));
        } else {
            super(quickSort(source.toIterable(), comparer));
        }
    }
}

function defaultComparer(left: any, right: any): number {
    if (left < right) { return -1; }
    if (right < left) { return 1; }
    return 0;
}

function* quickSort<T>(source: Iterable<T>, comparer: comparerFunc<T>): Iterable<T> {
    const above = [];
    const below = [];
    const equal = [];
    const iterator = source[Symbol.iterator]();
    let anchor;
    if (!({ value: anchor } = iterator.next()).done) {
        return;
    }
    equal.push(anchor);
    let value;
    while (!({ value } = iterator.next()).done) {
        const order = comparer(anchor, value);
        if (order < 0) {
            below.push(value);
        } else if (order > 0) {
            above.push(value);
        } else {
            equal.push(value);
        }
    }

    yield* quickSort(below, comparer);
    yield* equal;
    yield* quickSort(above, comparer);
}