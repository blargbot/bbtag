import { SubtagContext } from '../structures';
import { TokenRange, Try } from '../util';

export type SubtagPrimitiveResult = null | undefined | void | string | number | boolean;
export type SubtagResult = SubtagPrimitiveResult | SubtagResultArray | ISubtagError;
export type SubtagResultArray = SubtagPrimitiveResult[] & { name?: string };
export type SubtagResultType = keyof SubtagResultTypeMap;
export type SwitchHandlers<T> = { [K in keyof SubtagResultTypeMap]?: (value: SubtagResultTypeMap[K]) => T };

// tslint:disable-next-line: interface-over-type-literal
export type SubtagResultTypeMap = {
    string: string,
    number: number,
    boolean: boolean,
    null: null | undefined | void,
    array: SubtagResultArray,
    error: ISubtagError
};

export interface IBBTag {
    source: string;
    root: IStringToken;
}

export interface IStringToken {
    readonly format: string;
    readonly subtags: readonly ISubtagToken[];
    readonly range: TokenRange;
}

export interface ISubtagToken {
    readonly name: IStringToken;
    readonly args: readonly IStringToken[];
    readonly range: TokenRange;
}

export interface ISubtagError {
    readonly message: string;
    readonly token: IStringToken | ISubtagToken;
    readonly context: SubtagContext;
}

export interface ISerializer<T> {
    serialize(this: void, value: T): string;
    deserialize(this: void, value: string): T;
    tryDeserialize(this: void, value: string): Try.Result<T>;
}

export interface ISubtagResultCollection {
    startsWith(target: SubtagResult): boolean;
    endsWith(target: SubtagResult): boolean;
    includes(target: SubtagResult): boolean;
}