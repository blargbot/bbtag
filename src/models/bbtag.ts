import { Range } from './range';

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