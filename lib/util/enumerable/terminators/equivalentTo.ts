import { Enumerable } from '..';
import { EnumerableSource } from '../types';

export function equivalentTo<T>(this: Enumerable<T>, other: EnumerableSource<T>, checkOrder: boolean = true): boolean {
    const method = checkOrder ? sequenceEqual : countEqual;
    return method.bind(this)(Enumerable.from(other));
}

export function sequenceEqual<T>(this: Enumerable<T>, other: Enumerable<T>): boolean {
    const [tE, oE] = [this.getEnumerator(), other.getEnumerator()];
    let thisNext = false;

    while ((thisNext = tE.moveNext()) && oE.moveNext()) {
        if (tE.current !== oE.current) {
            return false;
        }
    }

    return !thisNext && !oE.moveNext();
}

function countEqual<T>(this: Enumerable<T>, other: Enumerable<T>): boolean {
    const values = [...this];
    for (const value of other) {
        const index = values.indexOf(value);
        if (index === -1) {
            return false;
        }
        values.splice(index, 1);
    }

    return values.length === 0;
}