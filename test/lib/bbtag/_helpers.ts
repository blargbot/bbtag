import { ISubtagError, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SubtagResultType } from '../../../lib/bbtag/types';

export const typeMappingTestData: Array<{ input: SubtagResult, type: SubtagResultType }> = [
    { input: 'aaaaa', type: 'string' },
    { input: ' ', type: 'string' },
    { input: '', type: 'string' },
    { input: 12345, type: 'number' },
    { input: NaN, type: 'number' },
    { input: true, type: 'boolean' },
    { input: false, type: 'boolean' },
    { input: undefined, type: 'null' },
    { input: null, type: 'null' },
    { input: [1, 2, 3, 4, 5], type: 'array' },
    { input: [], type: 'array' },
    { input: ['a', 2, undefined, false], type: 'array' },
    { input: { message: 'msg', token: undefined!, context: undefined! }, type: 'error' }
];

export function toJSON(value: SubtagResult): string {
    switch (typeof value) {
        case 'number': return '' + value;
        default: return JSON.stringify(value);
    }
}

export function error(message: string, fallback?: SubtagResult): ISubtagError {
    return { message, token: undefined!, context: { fallback } };
}

export function array(contents: SubtagPrimitiveResult[], name?: string): SubtagResultArray {
    const result = contents as SubtagResultArray;
    result.name = name;
    return result;
}