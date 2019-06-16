import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { selector, EnumerableSource } from '../types';

export class SelectManyEnumerable<TSource, TResult> extends IterableEnumerable<TResult> {
    public constructor(source: Enumerable<TSource>, selector: selector<TSource, EnumerableSource<TResult>>) {
        super({ [Symbol.iterator]() { return _selectMany(source, selector); } });
    }

    public static create<TSource, TResult>(this: Enumerable<TSource>, selector: selector<TSource, EnumerableSource<TResult>>): SelectManyEnumerable<TSource, TResult> {
        return new SelectManyEnumerable(this, selector);
    }
}

function* _selectMany<TSource, TResult>(source: Enumerable<TSource>, selector: selector<TSource, EnumerableSource<TResult>>) {
    let index = 0;
    for (const entry of source.toIterable()) {
        yield* Enumerable.from(selector(entry, index++)).toIterable();
    }
}