import { IterableEnumerable } from '../adapters';
import { EnumerableSource } from '../types';
import { Enumerable } from '..';

export class ExceptEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Enumerable<T>, except: EnumerableSource<T>) {
        super({ [Symbol.iterator]() { return _except(source, Enumerable.from(except)); } });
    }

    public static create<T>(this: Enumerable<T>, other: EnumerableSource<T>): ExceptEnumerable<T> {
        return new ExceptEnumerable(this, other);
    }
}

function* _except<T>(source: Enumerable<T>, except: Enumerable<T>) {
    let set = new Set<T>();
    let enumerator = except.getEnumerator();
    let done = false;

    sourceloop:
    for (const element of source.toIterable()) {
        if (set.has(element))
            continue;

        while (!done && enumerator.moveNext()) {
            set.add(enumerator.current);

            if (enumerator.current == element) {
                continue sourceloop;
            }
        }

        done = true;
        yield element;
    }
}