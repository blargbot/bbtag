import { Enumerable, tryGet, TryGetResult } from '../util';
import { array, boolean, number } from './serialize';
import { ISubtagError, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SubtagResultTypeMap } from './types';

function convertError(type: string): (value: SubtagResult) => never {
    return (target: SubtagResult) => {
        throw new Error(`${isValue.error(target) ? toString(target) : JSON.stringify(target)} is not convertable to ${type}`);
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

function createErrorConverter<T>(converter: (value: SubtagResult) => TryGetResult<T>): (v: ISubtagError) => TryGetResult<T> {
    return v => isValue.null(v.context.fallback) ? tryGet.failure() : converter(v.context.fallback);
}

function relay<T>(v: T): T {
    return v;
}

export function toString(target: SubtagResult): string {
    return switchType(target, {
        string: relay,
        boolean: boolean.serialize,
        number: number.serialize,
        array: array.serialize,
        null: () => '',
        error: v => isValue.null(v.context.fallback) ? `\`${v.message}\`` : toString(v.context.fallback)
    });
}

const errorToBoolean = createErrorConverter(tryToBoolean);
export const toBoolean = createDefiniteConverter(tryToBoolean, 'boolean');
export function tryToBoolean(target: SubtagResult): TryGetResult<boolean> {
    return switchType(target, {
        string: boolean.tryDeserialize,
        boolean: tryGet.success,
        number: tryGet.failure,
        array: tryGet.failure,
        null: tryGet.failure,
        error: errorToBoolean
    });
}

const errorToNumber = createErrorConverter(tryToNumber);
export const toNumber = createDefiniteConverter(tryToNumber, 'number');
export function tryToNumber(target: SubtagResult): TryGetResult<number> {
    return switchType(target, {
        string: number.tryDeserialize,
        number: tryGet.success,
        boolean: tryGet.failure,
        array: tryGet.failure,
        null: tryGet.failure,
        error: errorToNumber
    });
}

const errorToArray = createErrorConverter(tryToArray);
export const toArray = createDefiniteConverter(tryToArray, 'array');
export function tryToArray(target: SubtagResult): TryGetResult<SubtagResultArray> {
    return switchType(target, {
        string: array.tryDeserialize,
        array: tryGet.success,
        number: tryGet.failure,
        boolean: tryGet.failure,
        null: tryGet.failure,
        error: errorToArray
    });
}

export function toPrimitive(target: SubtagResult): SubtagPrimitiveResult {
    return switchType(target, {
        string: relay,
        number: relay,
        boolean: relay,
        null: relay,
        error: v => isValue.null(v.context.fallback) ? toString(v) : toPrimitive(v.context.fallback),
        array: toString
    });
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

export const isValue: { [K in keyof SubtagResultTypeMap]: (target: SubtagResult) => target is SubtagResultTypeMap[K] } = {
    string(target: SubtagResult): target is SubtagResultTypeMap['string'] {
        return typeof target === 'string';
    },
    number(target: SubtagResult): target is SubtagResultTypeMap['number'] {
        return typeof target === 'number';
    },
    boolean(target: SubtagResult): target is SubtagResultTypeMap['boolean'] {
        return typeof target === 'boolean';
    },
    array(target: SubtagResult): target is SubtagResultTypeMap['array'] {
        return Array.isArray(target);
    },
    null(target: SubtagResult): target is SubtagResultTypeMap['null'] {
        return target === undefined || target === null;
    },
    error(target: SubtagResult): target is SubtagResultTypeMap['error'] {
        if (typeof target !== 'object' || target === null) {
            return false;
        }

        return errorKeys.equivalentTo(Object.keys(target), false);
    }
};

export function getType(target: SubtagResult): keyof SubtagResultTypeMap {
    switch (typeof target) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
    }
    if (isValue.array(target)) { return 'array'; }
    if (isValue.error(target)) { return 'error'; }
    return 'null';
}

type SwitchHandlers<T> = { [K in keyof SubtagResultTypeMap]?: (value: SubtagResultTypeMap[K]) => T };
type SwitchResult<T, H extends SwitchHandlers<T>> = H extends Required<SwitchHandlers<T>> ? T : T | undefined;

export function switchType<T, H extends SwitchHandlers<T>>(target: SubtagResult, handlers: H): SwitchResult<T, H> {
    const handler = handlers[getType(target)] || (() => undefined);
    return handler(target as never) as SwitchResult<T, H>;
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
        if (isValue.null(target)) { return false; }
        return this._source.startsWith(toString(target));
    }

    public endsWith(target: SubtagResult): boolean {
        if (isValue.null(target)) { return false; }
        return this._source.endsWith(toString(target));
    }

    public includes(target: SubtagResult): boolean {
        if (isValue.null(target)) { return false; }
        return this._source.includes(toString(target));
    }
}