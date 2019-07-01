import { Enumerable } from '..';
import { IterableEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export class ZipEnumerable<TLeft, TRight, TResult> extends IterableEnumerable<TResult> {
    public static create<TLeft, TRight, TResult>(
        this: EnumerableSource<TLeft>,
        right: EnumerableSource<TRight>,
        selector: (left: TLeft, right: TRight) => TResult
    ): ZipEnumerable<TLeft, TRight, TResult> {
        return new ZipEnumerable(this, right, selector);
    }

    public constructor(
        left: EnumerableSource<TLeft>,
        right: EnumerableSource<TRight>,
        selector: (left: TLeft, right: TRight) => TResult
    ) {
        const eLeft = Enumerable.from(left);
        const eRight = Enumerable.from(right);
        super(() => _zip(eLeft, eRight, selector));
    }
}

function* _zip<TLeft, TRight, TResult>(
    left: Enumerable<TLeft>,
    right: Enumerable<TRight>,
    selector: (left: TLeft, right: TRight) => TResult
): IterableIterator<TResult> {
    const lEnumerator = left.getEnumerator();
    const rEnumerator = right.getEnumerator();

    while (lEnumerator.moveNext() && rEnumerator.moveNext()) {
        yield selector(lEnumerator.current, rEnumerator.current);
    }
}