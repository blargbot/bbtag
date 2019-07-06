import { SubtagError } from '../structures';
import { tryGet, TryGetResult } from '../util';
import { array, boolean, number } from './serializer';
import { SubtagPrimativeResult, SubtagResult } from './types';

export function toString(value: SubtagResult): string {
    switch (getType(value)) {
        case 'string': return value as string;
        case 'number': return number.serialize(value as number);
        case 'boolean': return boolean.serialize(value as boolean);
        case 'array': return array.serialize(value as any[]);
        case 'error':
            const error = value as SubtagError;
            if (error.context.fallback !== undefined) { return toString(error.context.fallback); }
            return `\`${(value as SubtagError).message}\``;
        case 'undefined':
        default: return '';
    }
}

export function tryToBoolean(value: SubtagResult): TryGetResult<boolean> {
    switch (getType(value)) {
        case 'string': return boolean.tryDeserialize(value as string);
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
        case 'string': return number.tryDeserialize(value as string);
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
        case 'string': return array.tryDeserialize(value as string);
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
        case 'array': return array.serialize(value as any[]);
        case 'error': return `\`${(value as SubtagError).message}\``;
        default: return '';
    }
}

export function toCollection(value: SubtagResult): ICollection {
    const asArray = tryToArray(value);
    if (asArray.success) {
        return new ArrayCollection(asArray.value);
    }
    return toString(value);
}

export function getType(value: SubtagResult): string | undefined {
    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'undefined': return 'undefined';
        case 'object':
            if (value === null) { return 'undefined'; }
            if (Array.isArray(value)) { return 'array'; }
            if (value instanceof SubtagError) { return 'error'; }
            break;
    }

    return undefined;
}

export interface ICollection {
    startsWith(value: SubtagResult): boolean;
    endsWith(value: SubtagResult): boolean;
    includes(value: SubtagResult): boolean;
}

class ArrayCollection implements ICollection {
    private readonly _source: SubtagPrimativeResult[];
    constructor(source: SubtagPrimativeResult[]) {
        this._source = source;
    }

    public startsWith(value: SubtagResult): boolean {
        return this._source[0] === toPrimative(value);
    }

    public endsWith(value: SubtagResult): boolean {
        return this._source[this._source.length - 1] === toPrimative(value);
    }

    public includes(value: SubtagResult): boolean {
        return this._source.indexOf(toPrimative(value)) !== -1;
    }
}