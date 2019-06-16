import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { selector } from '../types';

export class SelectEnumerable<TSource, TResult> extends IterableEnumerable<TResult> {
    public constructor(source: Enumerable<TSource>, selector: selector<TSource, TResult>) {
        super({ [Symbol.iterator]() { return _select(source, selector); } });
    }

    public static create<TSource, TResult>(this: Enumerable<TSource>, selector: selector<TSource, TResult>): SelectEnumerable<TSource, TResult> {
        return new SelectEnumerable(this, selector);
    }
}

function* _select<TSource, TResult>(source: Enumerable<TSource>, selector: selector<TSource, TResult>) {
    let index = 0;
    for (const element of source.toIterable()) {
        yield selector(element, index++);
    }
}