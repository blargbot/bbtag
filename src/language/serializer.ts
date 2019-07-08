import { tryGet, TryGetResult } from '../util';

export interface ISerializer<T> {
    serialize(value: T): string;
    deserialize(value: string): T;
    tryDeserialize(value: string): TryGetResult<T>;
}

function createDeserialize<T extends ISerializer<R>, R>(name: string):
    (this: T, value: string) => R {
    return function deserialize(this: T, value: string): R {
        const result = this.tryDeserialize(value);
        if (result.success) {
            return result.value;
        }
        throw new Error(`Failed to deserialize ${value} as ${name}`);
    };
}

export const array: ISerializer<any[]> = {
    deserialize: createDeserialize('array'),
    serialize(_value: any[]): string {
        return undefined!;
    },
    tryDeserialize(_value: string): TryGetResult<any[]> {
        return undefined!;
    }
};

export const object: ISerializer<any> = {
    deserialize: createDeserialize('object'),
    serialize(value: any): string {
        return JSON.stringify(value);
    },
    tryDeserialize(value: string): TryGetResult<any> {
        return JSON.parse(value);
    }
};

// tslint:disable-next-line: variable-name
export const number: ISerializer<number> = {
    deserialize: createDeserialize('number'),
    serialize(value: number): string {
        return value.toString();
    },
    tryDeserialize(value: string): TryGetResult<number> {
        const result = Number(value);
        if (isNaN(result) && !/^nan$/i.test(value)) {
            return tryGet.failure();
        }
        return tryGet.success(result);
    }
};

// tslint:disable-next-line: variable-name
export const boolean: ISerializer<boolean> = {
    deserialize: createDeserialize('boolean'),
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