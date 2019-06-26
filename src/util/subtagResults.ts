import { SubtagResult, SubtagError } from '../models';
import { default as serializer } from './serializer';
import { default as tryGet, TryGetResult } from './tryGet';
import { SubtagPrimativeResult } from '../models/subtag';

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
    tryToNumber,
    tryToBoolean,
    tryToArray
};