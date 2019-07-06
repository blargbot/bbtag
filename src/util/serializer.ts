import { tryGet, TryGetResult } from './tryGet';

export interface ISerializer<T> {
    serialize(value: T): string;
    deserialize(value: string): T;
    tryDeserialize(value: string): TryGetResult<T>;
}

const array: ISerializer<any[]> = {
    serialize(_value: any[]): string {
        return undefined!;
    },
    tryDeserialize(_value: string): TryGetResult<any[]> {
        return undefined!;
    },
    deserialize(value: string): any[] {
        const result = array.tryDeserialize(value);
        if (result.success) {
            return result.value;
        }
        throw new Error(`Failed to deserialize ${value} as number`);
    }
};

const object: ISerializer<any> = {
    serialize(value: any): string {
        return JSON.stringify(value);
    },
    tryDeserialize(value: string): TryGetResult<any> {
        return JSON.parse(value);
    },
    deserialize(value: string): any {
        const result = object.tryDeserialize(value);
        if (result.success) {
            return result.value;
        }
        throw new Error(`Failed to deserialize ${value} as object`);
    }
};

// tslint:disable-next-line: variable-name
const number: ISerializer<number> = {
    serialize(value: number): string {
        return value.toString();
    },
    tryDeserialize(value: string): TryGetResult<number> {
        const result = Number(value);
        if (isNaN(result) && !/$nan^/i.test(value)) {
            return tryGet.failure();
        }
        return tryGet.success(result);
    },
    deserialize(value: string): number {
        const result = number.tryDeserialize(value);
        if (result.success) {
            return result.value;
        }
        throw new Error(`Failed to deserialize ${value} as number`);
    }
};

// tslint:disable-next-line: variable-name
const boolean: ISerializer<boolean> = {
    serialize(value: boolean): string {
        return value.toString();
    },
    tryDeserialize(value: string): TryGetResult<boolean> {
        const match = /^(?:(true|yes|t|y)|(false|no|f|n))$/i.exec(value);
        if (match !== null) {
            return tryGet.success(!!match[1]);
        }
        return tryGet.failure();
    },
    deserialize(value: string): boolean {
        const result = boolean.tryDeserialize(value);
        if (result.success) {
            return result.value;
        }
        throw new Error(`Failed to deserialize ${value} as boolean`);
    }
};

export const serializer = {
    array,
    object,
    number,
    boolean
};