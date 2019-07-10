import { Enumerable } from '..';
import { EnumerableSource } from '../types';

export function equivalentTo<T>(this: Enumerable<T>, other: EnumerableSource<T>, checkOrder: boolean = true): boolean {
    const method = checkOrder ? sequenceEqual : countEqual;
    return method.bind(this)(Enumerable.from(other));
}

export function sequenceEqual<T>(this: Enumerable<T>, right: Enumerable<T>): boolean {
    const [lE, rE] = [this.getEnumerator(), right.getEnumerator()];
    let leftNext = false;

    while ((leftNext = lE.moveNext()) && rE.moveNext()) {
        if (lE.current !== rE.current) {
            return false;
        }
    }

    return !leftNext && !rE.moveNext();
}

function countEqual<T>(this: Enumerable<T>, right: Enumerable<T>): boolean {
    const leftValues = this.toArray();
    for (const value of right) {
        const index = leftValues.indexOf(value);
        if (index === -1) {
            return false;
        }
        leftValues.splice(index, 1);
    }

    return leftValues.length === 0;
}