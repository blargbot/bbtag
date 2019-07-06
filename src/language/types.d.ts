import { Range } from '../util';
import { SubtagError } from '../structures';

export type SubtagPrimativeResult = void | null | undefined | string | number | boolean;
export type SubtagResult = SubtagPrimativeResult | SubtagPrimativeResult[] | SubtagError;

export interface IToken {
    readonly range: Range;
}

export interface IBBTag {
    source: string;
    root: IStringToken;
}

export interface IStringToken extends IToken {
    readonly format: string;
    readonly subtags: readonly ISubtagToken[];
}

export interface ISubtagToken extends IToken {
    readonly name: IStringToken;
    readonly args: readonly IStringToken[];
}
