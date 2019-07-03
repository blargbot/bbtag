import { SubtagError, SubtagPrimativeResult, SubtagResult } from '../structures';
import { Enumerable } from './enumerable';
import { EnumerableSource } from './enumerable/types';
import { default as subtag } from './subtagResults';

export function compare(left: SubtagResult, right: SubtagResult): number {
    if (subtag.getType(left) === subtag.getType(right)) {
        return compareSameType(left, right);
    }
    return compareByBlock(subtag.toString(left), subtag.toString(right));
}

function compareByBlock(left: string, right: string): number {
    return compareIterable(toBlocks(left), toBlocks(right));
}

function compareSameType<T extends SubtagResult>(left: T, right: T): number {
    switch (subtag.getType(left)) {
        case 'string': return compareByBlock(left as string, right as string);
        case 'number':
        case 'boolean': return (left as number) - (right as number);
        case 'undefined': return 0;
        case 'error': return compareByBlock((left as SubtagError).message, (right as SubtagError).message);
        case 'array': return compareAsArray(left as any[], right as any[]);
        default: return compareByBlock(subtag.toString(left), subtag.toString(right));
    }
}

function compareAsArray(left: SubtagPrimativeResult[], right: SubtagPrimativeResult[]): number {
    return compareIterable(toStringOrNumber(left), toStringOrNumber(right));
}

function toBlocks(text: string): Array<string | number> {
    const regex = /[-+]?\d+(?:\.\d*)?(?:e\+?\d+)?/g;
    const numbers = text.match(regex) || [];
    const words = text.split(regex);

    const result = [];
    const max = Math.max(numbers.length, words.length);
    for (let i = 0; i < max; i++) {
        if (words[i] !== undefined) { result.push(words[i]); }
        if (numbers[i] !== undefined) { result.push(parseFloat(numbers[i])); }
    }
    return result;
}

function* toStringOrNumber(values: SubtagPrimativeResult[]): IterableIterator<string | number> {
    for (const value of values) {
        if (typeof value === 'number' || typeof value === 'string') {
            yield value;
        } else {
            yield subtag.toString(value);
        }
    }
}

function compareIterable(left: EnumerableSource<number>, right: EnumerableSource<number>): number;
function compareIterable(left: EnumerableSource<string>, right: EnumerableSource<string>): number;
function compareIterable(left: EnumerableSource<string | number>, right: EnumerableSource<string | number>): number;
function compareIterable<T extends string | number>(left: EnumerableSource<T>, right: EnumerableSource<T>): number {
    const leftE = Enumerable.from(left);
    const rightE = Enumerable.from(right);

    let result = 0;

    for (const [l, r] of leftE.zip(rightE, (_l, _r) => [_l, _r])) {
        if (l === r) { continue; }
        if (typeof l === 'number') { result--; }
        if (typeof r === 'number') { result++; }
        if (result !== 0) { return result; }

        if (l > r) { return 1; }
        if (r > l) { return -1; }

        if (isNaN(l as number)) { result--; }
        if (isNaN(r as number)) { result++; }
        if (result !== 0) { return result; }
    }

    return 0;
}

export default {
    byBlock: compareByBlock,
    sameType: compareSameType,
    asArray: compareAsArray
};