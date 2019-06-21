import { IterableEnumerable, ArrayEnumerable } from "../adapters";
import { comparer, selector } from "../types";
import { Enumerable } from "..";

export class OrderEnumerable<TSource> extends IterableEnumerable<TSource> {
    private readonly _base: Enumerable<TSource>;

    public constructor(source: Enumerable<TSource>, comparer: comparer<TSource>) {
        if (source instanceof ArrayEnumerable) {
            super(source.toIterable().sort(comparer))
        } else {
            super(quickSort(source.toIterable(), comparer));
        }

        this._base = source;
    }

    public static sort<TSource>(this: Enumerable<TSource>, comparer?: comparer<TSource>): OrderEnumerable<TSource> {
        return new OrderEnumerable(this, comparer || defaultComparer);
    }

    public static orderBy<TSource, TKey>(this: Enumerable<TSource>, selector: (source: TSource) => TKey, descending: boolean = false, comparer?: comparer<TKey>) {
        let direction = descending ? -1 : 1;
        comparer = comparer || defaultComparer;
        return this.sort((left, right) => direction * comparer!(selector(left), selector(right)))
    }
}

function defaultComparer(left: any, right: any): number {
    if (left < right) return -1;
    if (right < left) return 1;
    return 0;
}

function* quickSort<T>(source: Iterable<T>, comparer: comparer<T>): Iterable<T> {
    let above = [];
    let below = [];
    let equal = [];
    let iterator = source[Symbol.iterator]();
    let anchor;
    if (!({ value: anchor } = iterator.next()).done) {
        return;
    }
    equal.push(anchor);
    let value;
    while (!({ value } = iterator.next()).done) {
        let order = comparer(anchor, value);
        if (order < 0) below.push(value);
        else if (order > 0) above.push(value);
        else equal.push(value);
    }

    yield* quickSort(below, comparer);
    yield* equal;
    yield* quickSort(above, comparer);
}