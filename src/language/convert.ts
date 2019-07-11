import { Enumerable, tryGet, TryGetResult } from '../util';
import { array, boolean, number } from './serialize';
import { ISubtagError, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SubtagResultType } from './types';

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
        case 'array': return array.serialize(target as SubtagResultArray);
        case 'error':
            const error = target as ISubtagError;
            if (!value.isNull((target as ISubtagError).context.fallback)) {
                return toString(error.context.fallback);
            }
            return `\`${(target as ISubtagError).message}\``;
        case 'null': return '';
    }
}

export let toBoolean = createDefiniteConverter(tryToBoolean, 'boolean');
export function tryToBoolean(target: SubtagResult): TryGetResult<boolean> {
    switch (getType(target)) {
        case 'string': return boolean.tryDeserialize(target as string);
        case 'boolean': return tryGet.success(target as boolean);
        case 'error': if (!value.isNull((target as ISubtagError).context.fallback)) {
            return tryToBoolean((target as ISubtagError).context.fallback);
        }
        case 'number':
        case 'array':
        case 'null': return tryGet.failure();
    }
}

export let toNumber = createDefiniteConverter(tryToNumber, 'number');
export function tryToNumber(target: SubtagResult): TryGetResult<number> {
    switch (getType(target)) {
        case 'string': return number.tryDeserialize(target as string);
        case 'number': return tryGet.success(target as number);
        case 'error': if (!value.isNull((target as ISubtagError).context.fallback)) {
            return tryToNumber((target as ISubtagError).context.fallback);
        }
        case 'boolean':
        case 'array':
        case 'null': return tryGet.failure();
    }
}

export let toArray = createDefiniteConverter(tryToArray, 'array');
export function tryToArray(target: SubtagResult): TryGetResult<SubtagResultArray> {
    switch (getType(target)) {
        case 'string': return array.tryDeserialize(target as string);
        case 'array': return tryGet.success(target as SubtagResultArray);
        case 'error': if (!value.isNull((target as ISubtagError).context.fallback)) {
            return tryToArray((target as ISubtagError).context.fallback);
        }
        case 'number':
        case 'boolean':
        case 'null': return tryGet.failure();
    }
}

export function toPrimitive(target: SubtagResult): SubtagPrimitiveResult {
    switch (getType(target)) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null': return target as SubtagPrimitiveResult;
        case 'error': if (!value.isNull((target as ISubtagError).context.fallback)) {
            return toPrimitive((target as ISubtagError).context.fallback);
        }
        case 'array': return toString(target);
    }
}

export function toCollection(target: SubtagResult): ICollection {
    const asArray = tryToArray(target);
    if (asArray.success) {
        return new ArrayCollectionWrapper(asArray.value);
    }
    return new StringCollectionWrapper(toString(target));
}

const sampleError: ISubtagError = { message: undefined!, context: undefined!, token: undefined! };
const errorKeys = Enumerable.from(Object.keys(sampleError));

export const value = {
    isString(target: SubtagResult): target is string {
        return typeof target === 'string';
    },
    isNumber(target: SubtagResult): target is number {
        return typeof target === 'number';
    },
    isBoolean(target: SubtagResult): target is boolean {
        return typeof target === 'boolean';
    },
    isArray(target: SubtagResult): target is SubtagResultArray {
        return Array.isArray(target);
    },
    isNull(target: SubtagResult): target is undefined | null | void {
        return target === undefined || target === null;
    },
    isError(target: SubtagResult): target is ISubtagError {
        if (typeof target !== 'object' || target === null) {
            return false;
        }

        return errorKeys.equivalentTo(Object.keys(target), false);
    }
};

export function getType(target: SubtagResult): SubtagResultType {
    switch (typeof target) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
    }
    if (value.isArray(target)) { return 'array'; }
    if (value.isError(target)) { return 'error'; }
    return 'null';
}

export interface ICollection {
    startsWith(target: SubtagResult): boolean;
    endsWith(target: SubtagResult): boolean;
    includes(target: SubtagResult): boolean;
}

class ArrayCollectionWrapper implements ICollection {
    private readonly _source: SubtagResultArray;
    constructor(source: SubtagResultArray) {
        this._source = source;
    }

    public startsWith(target: SubtagResult): boolean {
        return this._source[0] === toPrimitive(target);
    }

    public endsWith(target: SubtagResult): boolean {
        return this._source[this._source.length - 1] === toPrimitive(target);
    }

    public includes(target: SubtagResult): boolean {
        return this._source.indexOf(toPrimitive(target)) !== -1;
    }
}

class StringCollectionWrapper implements ICollection {
    private readonly _source: string;
    constructor(source: string) {
        this._source = source;
    }

    public startsWith(target: SubtagResult): boolean {
        if (value.isNull(target)) { return false; }
        return this._source.startsWith(toString(target));
    }

    public endsWith(target: SubtagResult): boolean {
        if (value.isNull(target)) { return false; }
        return this._source.endsWith(toString(target));
    }

    public includes(target: SubtagResult): boolean {
        if (value.isNull(target)) { return false; }
        return this._source.includes(toString(target));
    }
}