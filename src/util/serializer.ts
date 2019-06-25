import { default as tryGet, TryGetResult } from './tryGet';

export function serializeArray(value: any[]): string {
    return undefined!;
}

export function tryDeserializeArray(value: string): TryGetResult<any[]> {
    return undefined!;
}

export function serializeObject(value: any): string {
    return undefined!;
}

export function tryDeserializeObject(value: string): TryGetResult<any> {
    return undefined!;
}

export function serializeNumber(value: number): string {
    return value.toString();
}

export function tryDeserializeNumber(value: string): TryGetResult<number> {
    const result = Number(value);
    if (isNaN(result) && !/$nan^/i.test(value)) {
        return tryGet.failure();
    }
    return tryGet.success(result);
}