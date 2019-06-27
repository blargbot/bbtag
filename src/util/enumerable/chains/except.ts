import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export class ExceptEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(this: Enumerable<T>, other: EnumerableSource<T>): ExceptEnumerable<T> {
        return new ExceptEnumerable(this, other);
    }

    public constructor(source: Enumerable<T>, except: EnumerableSource<T>) {
        super(() => _except(source, Enumerable.from(except)));
    }
}

function* _except<T>(source: Enumerable<T>, except: Enumerable<T>): IterableIterator<T> {
    const set = new Set<T>();
    const enumerator = except.getEnumerator();
    let done = false;

    sourceloop:
    for (const element of source) {
        if (set.has(element)) {
            continue;
        }

        while (!done && enumerator.moveNext()) {
            set.add(enumerator.current);

            if (enumerator.current === element) {
                continue sourceloop;
            }
        }

        done = true;
        yield element;
    }
}