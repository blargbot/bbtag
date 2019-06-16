import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export class ConcatEnumerable<T> extends IterableEnumerable<T> {
    public constructor(...sources: EnumerableSource<T>[]) {
        super({ [Symbol.iterator]() { return _concat(sources); } });
    }

    public static create<T>(this: EnumerableSource<T> | undefined, ...sources: EnumerableSource<T>[]): ConcatEnumerable<T> {
        if (this === undefined) {
            return new ConcatEnumerable(...sources);
        }
        return new ConcatEnumerable(this, ...sources);
    }
}

function* _concat<T>(sources: EnumerableSource<T>[]) {
    for (const source of sources) {
        yield* Enumerable.from(source).toIterable();
    }
}