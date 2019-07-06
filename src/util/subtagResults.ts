import { SubtagError, SubtagPrimativeResult, SubtagResult } from '../structures';
import { serializer } from './serializer';
import { tryGet, TryGetResult } from './tryGet';

function toString(value: SubtagResult): string {
    switch (getType(value)) {
        case 'string': return value as string;
        case 'number': return serializer.number.serialize(value as number);
        case 'boolean': return serializer.boolean.serialize(value as boolean);
        case 'array': return serializer.array.serialize(value as any[]);
        case 'error':
            const error = value as SubtagError;
            if (error.context.fallback !== undefined) { return toString(error.context.fallback); }
            return `\`${(value as SubtagError).message}\``;
        case 'undefined':
        default: return '';
    }
}

function tryToBoolean(value: SubtagResult): TryGetResult<boolean> {
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

function tryToNumber(value: SubtagResult): TryGetResult<number> {
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

function tryToArray(value: SubtagResult): TryGetResult<SubtagPrimativeResult[]> {
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

function toPrimative(value: SubtagResult): SubtagPrimativeResult {
    switch (getType(value)) {
        case 'string': return value as string;
        case 'number': return value as number;
        case 'boolean': return value as boolean;
        case 'undefined': return value as undefined;
        case 'array': return serializer.array.serialize(value as any[]);
        case 'error': return `\`${(value as SubtagError).message}\``;
        default: return '';
    }
}

function toCollection(value: SubtagResult): ICollection {
    const asArray = tryToArray(value);
    if (asArray.success) {
        return new ArrayCollection(asArray.value);
    }
    return toString(value);
}

function getType(value: SubtagResult): string | undefined {
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

import { compare } from './compare';

export const subtagValue = {
    toString,
    toPrimative,
    toCollection,
    tryToNumber,
    tryToArray,
    tryToBoolean,
    compare,
    getType
};

export interface ICollection {
    startsWith(value: SubtagResult): boolean;
    endsWith(value: SubtagResult): boolean;
    includes(value: SubtagResult): boolean;
}

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