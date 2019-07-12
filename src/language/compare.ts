import { Enumerable, EnumerableSource } from '../util';
import { getType, toNumber, toString } from './convert';
import { ISubtagError, SubtagPrimitiveResult, SubtagResult } from './types';

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
    switch (getType(left)) {
        case 'string': return compareByBlock(left as string, right as string);
        case 'number':
        case 'boolean': return compareAsNumber((left as number), (right as number));
        case 'null': return 0;
        case 'error': return compareByBlock((left as ISubtagError).message, (right as ISubtagError).message);
        case 'array': return compareAsArray(left as any[], right as any[]);
    }
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

function compareIterable(left: EnumerableSource<number>, right: EnumerableSource<number>): -1 | 0 | 1;
function compareIterable(left: EnumerableSource<string>, right: EnumerableSource<string>): -1 | 0 | 1;
function compareIterable(left: EnumerableSource<string | number>, right: EnumerableSource<string | number>): -1 | 0 | 1;
function compareIterable<T extends string | number>(left: EnumerableSource<T>, right: EnumerableSource<T>): -1 | 0 | 1 {
    const leftE = Enumerable.from(left).getEnumerator();
    const rightE = Enumerable.from(right).getEnumerator();

    let leftCont = true;

    while ((leftCont = leftE.moveNext()) && rightE.moveNext()) {
        let result = 0;
        const [l, r] = [leftE.current, rightE.current];
        if (l === r) { continue; }
        if (typeof l === 'number' && !isNaN(l)) { result--; }
        if (typeof r === 'number' && !isNaN(r)) { result++; }
        if (result !== 0) { return result as -1 | 1; }

        if (l > r) { return 1; }
        if (r > l) { return -1; }

        if (isTrueNaN(l) && !isTrueNaN(r)) { return 1; }
        if (!isTrueNaN(l) && isTrueNaN(r)) { return -1; }
    }

    return leftCont ? 1 : rightE.moveNext() ? -1 : 0;
}

function isTrueNaN(value: any): boolean {
    return typeof value === 'number' && isNaN(value);
}