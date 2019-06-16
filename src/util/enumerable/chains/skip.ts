import { IterableEnumerable } from '../adapters';
import { predicate } from '../types';
import { Enumerable } from '..';

export class SkipEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Enumerable<T>, skipWhile: predicate<T>) {
        super({ [Symbol.iterator]() { return _skipWhile(source, skipWhile); } });
    }

    public static create<T>(this: Enumerable<T>, count: number): SkipEnumerable<T>
    public static create<T>(this: Enumerable<T>, skipWhile: predicate<T>): SkipEnumerable<T>
    public static create<T>(this: Enumerable<T>, condition: predicate<T> | number): SkipEnumerable<T> {
        let skipWhile: predicate<T> = typeof condition === 'number' ? (_, index) => index < condition : condition;
        return new SkipEnumerable(this, skipWhile);
    }
}

function* _skipWhile<T>(source: Enumerable<T>, skipWhile: predicate<T>) {
    let index = 0;
    let enumerator = source.getEnumerator();
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