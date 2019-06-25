import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { selectorFunc } from '../types';

export class SelectEnumerable<TSource, TResult> extends IterableEnumerable<TResult> {
    public static create<TS, TR>(this: Enumerable<TS>, selector: selectorFunc<TS, TR>): SelectEnumerable<TS, TR> {
        return new SelectEnumerable(this, selector);
    }

    public constructor(source: Enumerable<TSource>, selector: selectorFunc<TSource, TResult>) {
        super(() => _select(source, selector));
    }
}

function* _select<TS, TR>(source: Enumerable<TS>, selector: selectorFunc<TS, TR>): IterableIterator<TR> {
    let index = 0;
    for (const element of source.toIterable()) {
        yield selector(element, index++);
    }
}