import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { selectorFunc } from '../types';

export class Grouping<TSource, TKey> extends IterableEnumerable<TSource> {
    public readonly key: TKey;

    public constructor(key: TKey, source: Enumerable<TSource>) {
        super(source.toIterable());
        this.key = key;
    }
}

export class GroupByEnumerable<TSource, TKey> extends IterableEnumerable<Grouping<TSource, TKey>> {
    public static create<TK, TS>(this: Enumerable<TS>, selector: selectorFunc<TS, TK>): GroupByEnumerable<TS, TK> {
        return new GroupByEnumerable(this, selector);
    }

    public constructor(source: Enumerable<TSource>, selector: selectorFunc<TSource, TKey>) {
        super(() => _groupBy(source, selector));
    }
}

function* _groupBy<TS, TK>(source: Enumerable<TS>, selector: selectorFunc<TS, TK>): IterableIterator<Grouping<TS, TK>> {
    const result = new Map<TK, TS[]>();
    let index = 0;
    for (const element of source.toIterable()) {
        const key = selector(element, index++);
        if (!result.has(key)) {
            result.set(key, [element]);
        } else {
            result.get(key)!.push(element);
        }
    }
    for (const entry of result) {
        yield new Grouping(entry[0], Enumerable.from(entry[1]));
    }
}