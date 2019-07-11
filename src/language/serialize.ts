import { Enumerable, tryGet, TryGetResult } from '../util';
import { toPrimitive } from './convert';
import { SubtagResultArray } from './types';

export interface ISerializer<T> {
    serialize(value: T): string;
    deserialize(value: string): T;
    tryDeserialize(value: string): TryGetResult<T>;
}

function createDeserialize<T>(name: string, thisFunc: () => ISerializer<T>): (value: string) => T {
    return function constructAndRun(outer: string): T {
        const self = thisFunc();
        self.deserialize = function deserialize(value: string): T {
            const result = self.tryDeserialize(value);
            if (result.success) {
                return result.value;
            }
            throw new Error(`Failed to deserialize ${value} as ${name}`);
        };
        return self.deserialize(outer);
    };
}

interface IRawArray {
    n: string;
    v: SubtagResultArray;
}
const namedRawArray = { v: [], n: '' };
const rawArrayKeys = Enumerable.from(Object.keys(namedRawArray));

function isRawArray(value: any): value is IRawArray {
    return typeof value === 'object' &&
        rawArrayKeys.equivalentTo(Object.keys(value)) &&
        Array.isArray(value.v) &&
        typeof value.n === 'string';
}

export const array: ISerializer<SubtagResultArray> = {
    deserialize: createDeserialize('array', () => array),
    serialize(value: SubtagResultArray): string {
        if (value.name === undefined) {
            return JSON.stringify(value);
        }
        return JSON.stringify({ v: value, n: value.name });
    },
    tryDeserialize(value: string): TryGetResult<SubtagResultArray> {
        try {
            const obj = JSON.parse(value);
            if (Array.isArray(obj)) {
                return tryGet.success(obj.map(toPrimitive));
            } else if (isRawArray(obj)) {
                obj.v.name = obj.n;
                return tryGet.success(obj.v);
            }
        } catch { }
        return tryGet.failure();
    }
};

// tslint:disable-next-line: variable-name
export const number: ISerializer<number> = {
    deserialize: createDeserialize('number', () => number),
    serialize(value: number): string {
        return value.toString();
    },
    tryDeserialize(value: string): TryGetResult<number> {
        value = value.replace(/[,\.](?=\d*?[,\.])/g, '').replace(',', '.');
        let result = Number(value);
        if (isNaN(result)) {
            const isInfinity = /^([-+]?)\s*infinity$/i.exec(value);
            if (isInfinity) {
                result = isInfinity[1] === '-' ? -Infinity : Infinity;
            } else if (!/^nan$/i.test(value)) {
                return tryGet.failure();
            }
        }
        return tryGet.success(result);
    }
};

// tslint:disable-next-line: variable-name
export const boolean: ISerializer<boolean> = {
    deserialize: createDeserialize('boolean', () => boolean),
    serialize(value: boolean): string {
        return value.toString();
    },
    tryDeserialize(value: string): TryGetResult<boolean> {
        const match = /^(?:(true|yes|t|y)|(false|no|f|n))$/i.exec(value);
        if (match !== null) {
            return tryGet.success(!!match[1]);
        }
        return tryGet.failure();
    }
};