import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { predicateFunc } from '../types';

export class TakeEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(this: Enumerable<T>, count: number): TakeEnumerable<T>;
    public static create<T>(this: Enumerable<T>, takeWhile: predicateFunc<T>): TakeEnumerable<T>;
    public static create<T>(this: Enumerable<T>, condition: predicateFunc<T> | number): TakeEnumerable<T> {
        const takeWhile: predicateFunc<T> = typeof condition === 'number' ? (_, index) => index < condition : condition;
        return new TakeEnumerable(this, takeWhile);
    }

    public constructor(source: Enumerable<T>, takeWhile: predicateFunc<T>) {
        super(() => _takeWhile(source, takeWhile));
    }
}

function* _takeWhile<T>(source: Enumerable<T>, takeWhile: predicateFunc<T>): IterableIterator<T> {
    let index = 0;
    const enumerator = source.getEnumerator();

    while (enumerator.moveNext() && takeWhile(enumerator.current, index++)) {
        yield enumerator.current;
    }
}