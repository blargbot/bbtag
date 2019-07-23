import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { EnumerableSource, selectorFunc } from '../types';

export class SelectManyEnumerable<TSource, TResult> extends IterableEnumerable<TResult> {
    public static create<TS, TR>(this: Enumerable<TS>, selector: selectorFunc<TS, EnumerableSource<TR>>): SelectManyEnumerable<TS, TR> {
        return new SelectManyEnumerable(this, selector);
    }

    public constructor(source: Enumerable<TSource>, selector: selectorFunc<TSource, EnumerableSource<TResult>>) {
        super(() => _selectMany(source, selector));
    }
}

function* _selectMany<TS, TR>(source: Enumerable<TS>, selector: selectorFunc<TS, EnumerableSource<TR>>): IterableIterator<TR> {
    let index = 0;
    for (const entry of source) {
        yield* Enumerable.from(selector(entry, index++));
    }
}