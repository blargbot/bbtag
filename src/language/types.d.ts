import { Range } from '../util';
import { SubtagContext } from '../structures';

export type SubtagPrimativeResult = void | null | undefined | string | number | boolean;
export type SubtagResult = SubtagPrimativeResult | SubtagPrimativeResult[] | ISubtagError;

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