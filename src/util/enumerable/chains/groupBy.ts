import { IterableEnumerable } from '../adapters';
import { Enumerable } from '..';
import { selector } from '../types';

export class Grouping<TSource, TKey> extends IterableEnumerable<TSource> {
    public readonly key: TKey;

    public constructor(key: TKey, source: Enumerable<TSource>) {
        super(source.toIterable());
        this.key = key;
    }
}

export class GroupByEnumerable<TSource, TKey> extends IterableEnumerable<Grouping<TSource, TKey>> {
    public constructor(source: Enumerable<TSource>, selector: selector<TSource, TKey>) {
        super({
            *[Symbol.iterator]() {
                let result = new Map<TKey, TSource[]>();
                let index = 0;
                for (const element of source.toIterable()) {
                    let key = selector(element, index++);
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
        });
    }

    public static create<TKey, TSource>(this: Enumerable<TSource>, selector: selector<TSource, TKey>): GroupByEnumerable<TSource, TKey> {
        return new GroupByEnumerable(this, selector);
    }
}