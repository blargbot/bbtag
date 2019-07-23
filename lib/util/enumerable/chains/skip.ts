import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { predicateFunc } from '../types';

export class SkipEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(this: Enumerable<T>, count: number): SkipEnumerable<T>;
    public static create<T>(this: Enumerable<T>, skipWhile: predicateFunc<T>): SkipEnumerable<T>;
    public static create<T>(this: Enumerable<T>, condition: predicateFunc<T> | number): SkipEnumerable<T> {
        const skipWhile: predicateFunc<T> = typeof condition === 'number' ? (_, index) => index < condition : condition;
        return new SkipEnumerable(this, skipWhile);
    }

    public constructor(source: Enumerable<T>, skipWhile: predicateFunc<T>) {
        super(() => _skipWhile(source, skipWhile));
    }
}

function* _skipWhile<T>(source: Enumerable<T>, skipWhile: predicateFunc<T>): IterableIterator<T> {
    let index = 0;
    const enumerator = source.getEnumerator();
    while (enumerator.moveNext()) {
        if (!skipWhile(enumerator.current, index++)) {
            yield enumerator.current;
            break;
        }
    }

    while (enumerator.moveNext()) {
        yield enumerator.current;
    }
}