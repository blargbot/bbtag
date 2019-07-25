import { Enumerable, Source } from '../util';
import { getType, switchType, toNumber, toString } from './convert';
import { SubtagPrimitiveResult, SubtagResult } from './types';

/**
 * Compares left to right. If left comes before right, -1 is returned. If right comes before left, +1 is returned.
 * If they are equivalent, 0 is returned.
 *
 * Comparing is done as number < string < NaN.
 * If the type of left is different to right, both are converted to a string before comparison.
 * @param left The left hand side of the comparison
 * @param right The right hand side of the comparison
 */
export function compare(left: SubtagResult, right: SubtagResult): -1 | 0 | 1 {
    if (getType(left) === getType(right)) {
        return compareSameType(left, right);
    }
    return compareByBlock(toString(left), toString(right));
}

function compareByBlock(left: string, right: string): -1 | 0 | 1 {
    return compareIterable(toBlocks(left), toBlocks(right));
}

function compareSameType<T extends SubtagResult>(left: T, right: T): -1 | 0 | 1 {
    const r: any = right;
    return switchType(left, {
        string: l => compareByBlock(l, r),
        number: l => compareAsNumber(l, r),
        boolean: l => compareAsNumber(+l, +r),
        null: _ => 0,
        error: l => compareByBlock(l.message, r.message),
        array: l => compareAsArray(l, r)
    });
}

function compareAsNumber(left: number, right: number): -1 | 0 | 1 {
    if (isNaN(left)) {
        return isNaN(right) ? 0 : 1;
    }
    if (isNaN(right)) {
        return -1;
    }
    const sub = left - right;
    if (sub > 0) { return 1; }
    if (sub < 0) { return -1; }
    return 0;
}

function compareAsArray(left: SubtagPrimitiveResult[], right: SubtagPrimitiveResult[]): -1 | 0 | 1 {
    return compareIterable(toStringOrNumber(left), toStringOrNumber(right));
}

function toBlocks(text: string): Array<string | number> {
    const regex = /[-+]?\d+(?:\.\d*)?(?:e\+?\d+)?/g;
    const numbers = text.match(regex) || [];
    const words = text.split(regex);

    const result = [];
    for (let i = 0; i < numbers.length; i++) {
        result.push(words[i]);
        result.push(toNumber(numbers[i]));
    }
    result.push(words[words.length - 1]);
    return result;
}

function* toStringOrNumber(values: SubtagPrimitiveResult[]): IterableIterator<string | number> {
    for (const value of values) {
        if (typeof value === 'number' || typeof value === 'string') {
            yield value;
        } else {
            yield toString(value);
        }
    }
}

function compareIterable<T extends string | number>(left: Source<T>, right: Source<T>): -1 | 0 | 1 {
    const [le, re] = [left, right].map(Enumerable.from).map(e => e.getEnumerator());

    let lc: boolean;
    while ((lc = le.moveNext()) && re.moveNext()) {
        const [l, r] = [le, re].map(e => e.current);

        if (typeof l !== typeof r) {
            return typeof l === 'number' ? -1 : 1;
        }

        if (typeof l === 'number' && typeof r === 'number') {
            if (isNaN(l) && isNaN(r)) { continue; }
            if (isNaN(l)) { return 1; }
            if (isNaN(r)) { return -1; }
        }

        if (l < r) { return -1; }
        if (l > r) { return 1; }
    }

    return lc ? 1 : re.moveNext() ? -1 : 0;
}