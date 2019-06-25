import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export class ConcatEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(this: EnumerableSource<T>, ...sources: Array<EnumerableSource<T>>): ConcatEnumerable<T> {
        if (this === undefined) {
            return new ConcatEnumerable(...sources);
        }
        return new ConcatEnumerable(this, ...sources);
    }

    public constructor(...sources: Array<EnumerableSource<T>>) {
        super(() => _concat(sources));
    }
}

function* _concat<T>(sources: Array<EnumerableSource<T>>): IterableIterator<T> {
    for (const source of sources) {
        yield* Enumerable.from(source).toIterable();
    }
}