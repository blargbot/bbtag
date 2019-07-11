import { tryGet, TryGetResult } from '../util';
import { array, boolean, number } from './serializer';
import { ISubtagError, SubtagPrimativeResult, SubtagResult, SubtagResultArray, SubtagResultType } from './types';

function convertError(type: string): (value: SubtagResult) => never {
    return (target: SubtagResult) => {
        throw new Error(`${value.isError(target) ? toString(target) : JSON.stringify(target)} is not convertable to ${type}`);
    };
}

function createDefiniteConverter<T>(tryConvert: (value: SubtagResult) => TryGetResult<T>, typeName: string):
    (value: SubtagResult, defaultValue?: T | ((value: SubtagResult) => T)) => T {
    const errorHandler = convertError(typeName);
    return (target: SubtagResult, defaultValue: T | ((value: SubtagResult) => T) = errorHandler): T => {
        const result = tryConvert(target);
        const onFailure = typeof defaultValue === 'function' ? defaultValue as (value: SubtagResult) => T : () => defaultValue;
        return result.success ? result.value : onFailure(target);
    };
}

export function toString(target: SubtagResult): string {
    switch (getType(target)) {
        case 'string': return target as string;
        case 'number': return number.serialize(target as number);
        case 'boolean': return boolean.serialize(target as boolean);
        case 'array': return array.serialize(target as any[]);
        case 'error':
            const error = target as ISubtagError;
            if (error.context.fallback !== undefined) { return toString(error.context.fallback); }
            return `\`${(target as ISubtagError).message}\``;
        case 'undefined': return '';
    }
}

export let toBoolean = createDefiniteConverter(tryToBoolean, 'boolean');
export function tryToBoolean(target: SubtagResult): TryGetResult<boolean> {
    switch (getType(target)) {
        case 'string': return boolean.tryDeserialize(target as string);
        case 'boolean': return tryGet.success(target as boolean);
        case 'number':
        case 'array':
        case 'error':
        case 'undefined': return tryGet.failure();
    }
}

export let toNumber = createDefiniteConverter(tryToNumber, 'number');
export function tryToNumber(target: SubtagResult): TryGetResult<number> {
    switch (getType(target)) {
        case 'string': return number.tryDeserialize(target as string);
        case 'number': return tryGet.success(target as number);
        case 'boolean':
        case 'array':
        case 'error':
        case 'undefined': return tryGet.failure();
    }
}

export let toArray = createDefiniteConverter(tryToArray, 'array');
export function tryToArray(target: SubtagResult): TryGetResult<SubtagResultArray> {
    switch (getType(target)) {
        case 'string': return array.tryDeserialize(target as string);
        case 'array': return tryGet.success(target as SubtagResultArray);
        case 'number':
        case 'boolean':
        case 'error':
        case 'undefined': return tryGet.failure();
    }
}

export function toPrimative(target: SubtagResult): SubtagPrimativeResult {
    switch (getType(target)) {
        case 'string': return target as string;
        case 'number': return target as number;
        case 'boolean': return target as boolean;
        case 'undefined': return target as undefined;
        case 'array': return array.serialize(target as any[]);
        case 'error': return `\`${(target as ISubtagError).message}\``;
    }
}

export function toCollection(target: SubtagResult): ICollection {
    const asArray = tryToArray(target);
    if (asArray.success) {
        return new ArrayCollection(asArray.value);
    }
    return toString(target);
}

const sampleError: ISubtagError = { message: undefined!, context: undefined!, token: undefined! };
const errorKeys = Object.keys(sampleError);

export const value = {
    isString(target: any): target is string {
        return typeof target === 'string';
    },
    isNumber(target: any): target is number {
        return typeof target === 'number';
    },
    isBoolean(target: any): target is boolean {
        return typeof target === 'boolean';
    },
    isArray(target: SubtagResult): target is SubtagResultArray {
        return Array.isArray(target);
    },
    isUndefined(target: any): target is undefined | null | void {
        return target === undefined || target === null;
    },
    isError(target: any): target is ISubtagError {
        if (typeof target !== 'object' || target === null) {
            return false;
        }

        const keys = Object.keys(target);
        return keys.length === errorKeys.length &&
            errorKeys.every(k => keys.indexOf(k) !== -1);
    }
};

export function getType(target: SubtagResult): SubtagResultType {
    switch (typeof target) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'undefined': return 'undefined';
        case 'object':
            if (target === null) { return 'undefined'; }
            if (Array.isArray(target)) { return 'array'; }
            if (value.isError(target)) { return 'error'; }
    }
    throw new Error('Invalid subtag result: ' + JSON.stringify(target));
}

export interface ICollection {
    startsWith(target: SubtagResult): boolean;
    endsWith(target: SubtagResult): boolean;
    includes(target: SubtagResult): boolean;
}

class ArrayCollection implements ICollection {
    private readonly _source: SubtagResultArray;
    constructor(source: SubtagResultArray) {
        this._source = source;
    }

    public startsWith(target: SubtagResult): boolean {
        return this._source[0] === toPrimative(target);
    }

    public endsWith(target: SubtagResult): boolean {
        return this._source[this._source.length - 1] === toPrimative(target);
    }

    public includes(target: SubtagResult): boolean {
        return this._source.indexOf(toPrimative(target)) !== -1;
    }
}