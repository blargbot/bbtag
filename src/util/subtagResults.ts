import { SubtagResult, SubtagError } from '../models';
import { default as serializer } from './serializer';
import { default as tryGet, TryGetResult } from './tryGet';
import { SubtagPrimativeResult } from '../models/subtag';
import { Enumerable } from './enumerable';
import { EnumerableSource } from './enumerable/types';

export interface ICollection {
    startsWith(value: SubtagResult): boolean;
    endsWith(value: SubtagResult): boolean;
    includes(value: SubtagResult): boolean;
}

export function toString(value: SubtagResult): string {
    switch (getType(value)) {
        case 'string': return value as string;
        case 'number': return serializer.number.serialize(value as number);
        case 'boolean': return serializer.boolean.serialize(value as boolean);
        case 'array': return serializer.array.serialize(value as any[]);
        case 'error': return `\`${(value as SubtagError).message}\``;
        case 'undefined':
        default: return '';
    }
}

export function tryToBoolean(value: SubtagResult): TryGetResult<boolean> {
    switch (getType(value)) {
        case 'string': return serializer.boolean.tryDeserialize(value as string);
        case 'boolean': return tryGet.success(value as boolean);
        case 'number':
        case 'array':
        case 'error':
        case 'undefined':
        default: return tryGet.failure();
    }
}

export function tryToNumber(value: SubtagResult): TryGetResult<number> {
    switch (getType(value)) {
        case 'string': return serializer.number.tryDeserialize(value as string);
        case 'number': return tryGet.success(value as number);
        case 'boolean':
        case 'array':
        case 'error':
        case 'undefined':
        default: return tryGet.failure();
    }
}

export function tryToArray(value: SubtagResult): TryGetResult<SubtagPrimativeResult[]> {
    switch (getType(value)) {
        case 'string': return serializer.array.tryDeserialize(value as string);
        case 'array': return tryGet.success(value as SubtagPrimativeResult[]);
        case 'number':
        case 'boolean':
        case 'error':
        case 'undefined':
        default: return tryGet.failure();
    }
}

export function toPrimative(value: SubtagResult): SubtagPrimativeResult {
    switch (getType(value)) {
        case 'string': return value as string;
        case 'number': return value as number;
        case 'boolean': return value as boolean;
        case 'undefined': return value as undefined;
        case 'error': return serializer.array.serialize(value as any[]);
        case 'array': return `\`${(value as SubtagError).message}\``;
        default: return '';
    }
}

export function compare(left: SubtagResult, right: SubtagResult): number {
    if (getType(left) === getType(right)) {
        return compareSameType(left, right);
    }
    return compareByBlock(toString(left), toString(right));
}

export function toCollection(value: SubtagResult): ICollection {
    const asArray = tryToArray(value);
    if (asArray.success) {
        return new ArrayCollection(asArray.value);
    }
    return toString(value);
}

function compareSameType<T extends SubtagResult>(left: T, right: T): number {
    switch (getType(left)) {
        case 'string': return compareByBlock(left as string, right as string);
        case 'number':
        case 'boolean': return (left as number) - (right as number);
        case 'undefined': return 0;
        case 'error': return compareByBlock((left as SubtagError).message, (right as SubtagError).message);
        case 'array': return compareAsArray(left as any[], right as any[]);
        default: return compareByBlock(toString(left), toString(right));
    }
}

function compareByBlock(left: string, right: string): number {
    return compareIterable(toBlocks(left), toBlocks(right));
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
            yield toString(value);
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

function getType(value: SubtagResult): string | undefined {
    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'undefined': return 'undefined';
        case 'object':
            if (Array.isArray(value)) { return 'array'; }
            if (value instanceof SubtagError) { return 'error'; }
            break;
    }

    return undefined;
}

export default {
    toString,
    toPrimative,
    tryToNumber,
    tryToBoolean,
    tryToArray,
    compare,
    toCollection
};

class ArrayCollection implements ICollection {
    private readonly _array: SubtagPrimativeResult[];
    constructor(array: SubtagPrimativeResult[]) {
        this._array = array;
    }

    public startsWith(value: SubtagResult): boolean {
        return this._array[0] === toPrimative(value);
    }

    public endsWith(value: SubtagResult): boolean {
        return this._array[this._array.length - 1] === toPrimative(value);
    }

    public includes(value: SubtagResult): boolean {
        return this._array.indexOf(toPrimative(value)) !== -1;
    }
}