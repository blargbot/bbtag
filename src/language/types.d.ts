import { Range } from '../util';
import { SubtagContext } from '../structures';

export type SubtagPrimitiveResult = null | undefined | void | string | number | boolean;
export type SubtagResult = SubtagPrimitiveResult | SubtagResultArray | ISubtagError;
export type SubtagResultArray = SubtagPrimitiveResult[] & { name?: string };
export type SubtagResultType = keyof SubtagResultTypeMap;

export type SubtagResultTypeMap = {
    string: string,
    number: number,
    boolean: boolean,
    null: null | undefined | void,
    array: SubtagResultArray,
    error: ISubtagError
}

export interface IBBTag {
    source: string;
    root: IStringToken;
}

export interface IStringToken {
    readonly format: string;
    readonly subtags: readonly ISubtagToken[];
    readonly range: Range;
}

export interface ISubtagToken {
    readonly name: IStringToken;
    readonly args: readonly IStringToken[];
    readonly range: Range;
}

export interface ISubtagError {
    readonly message: string;
    readonly token: IStringToken | ISubtagToken;
    readonly context: SubtagContext;
}