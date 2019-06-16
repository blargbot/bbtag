import { IterableEnumerable } from '../adapters';
import { predicate } from '../types';
import { Enumerable } from '..';

export class TakeEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Enumerable<T>, takeWhile: predicate<T>) {
        super({ [Symbol.iterator]() { return _takeWhile(source, takeWhile); } });
    }

    public static create<T>(this: Enumerable<T>, count: number): TakeEnumerable<T>
    public static create<T>(this: Enumerable<T>, takeWhile: predicate<T>): TakeEnumerable<T>
    public static create<T>(this: Enumerable<T>, condition: predicate<T> | number): TakeEnumerable<T> {
        let takeWhile: predicate<T> = typeof condition === 'number' ? (_, index) => index < condition : condition;
        return new TakeEnumerable(this, takeWhile);
    }
}

function* _takeWhile<T>(source: Enumerable<T>, takeWhile: predicate<T>) {
    let index = 0;
    let enumerator = source.getEnumerator();

    while (enumerator.moveNext() && takeWhile(enumerator.current, index++)) {
        yield enumerator.current;
    }
}