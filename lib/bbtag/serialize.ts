import { Enumerable, Try } from '../util';
import convert from './convert';
import { ISerializer, SubtagResultArray } from './types';

interface IRawArray {
    n?: string;
    v: any[];
}

const namedRawArray: IRawArray = { v: [], n: '' };
const rawArrayKeys = Enumerable.from(Object.keys(namedRawArray));

function isRawArray(value: any): value is IRawArray {
    return typeof value === 'object' &&
        rawArrayKeys.isSetEqual(Object.keys(value)) &&
        Array.isArray(value.v) &&
        typeof value.n === 'string';
}

function createSerializer<T>(
    typeName: string,
    serialize: ISerializer<T>['serialize'],
    tryDeserialize: ISerializer<T>['tryDeserialize']
): ISerializer<T> {
    return {
        serialize,
        tryDeserialize,
        deserialize(value: string): T {
            const result = tryDeserialize(value);
            if (result.success) {
                return result.value;
            }
            throw new Error(`Failed to deserialize '${value}' as ${typeName}`);
        }
    };
}

export const serializers = {
    array: createSerializer('array',
        (value: SubtagResultArray) => {
            if (value.name === undefined) {
                return JSON.stringify(value);
            }
            return JSON.stringify({ v: value, n: value.name });
        },
        (value: string) => {
            try {
                const obj = JSON.parse(value);
                const arr: IRawArray | undefined = Array.isArray(obj) ? { v: obj } : isRawArray(obj) ? obj : undefined;
                if (arr !== undefined) {
                    const result = arr.v.map(convert.toPrimitive) as SubtagResultArray;
                    result.name = arr.n;
                    return Try.success(result);
                }
            } catch { }
            return Try.failed;
        }),
    boolean: createSerializer('boolean',
        (value: boolean) => value.toString(),
        (value: string) => {
            const match = /^(?:(true|yes|t|y)|(false|no|f|n))$/i.exec(value);
            if (match !== null) {
                return Try.success(!!match[1]);
            }
            return Try.failed;
        }),
    number: createSerializer('number',
        (value: number) => value.toString(),
        (value: string) => {
            value = value.replace(/[,\.](?=\d*?[,\.])/g, '').replace(',', '.');
            let result = Number(value);
            if (isNaN(result)) {
                const isInfinity = /^([-+]?)\s*infinity$/i.exec(value);
                if (isInfinity) {
                    result = isInfinity[1] === '-' ? -Infinity : Infinity;
                } else if (!/^nan$/i.test(value)) {
                    return Try.failed;
                }
            }
            return Try.success(result);
        })
};

export default serializers;