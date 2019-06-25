import { Range } from './range';

export interface IToken {
    range: Range;
}

export interface IBBTag {
    source: string;
    root: IStringToken;
}

export interface IStringToken extends IToken {
    format: string;
    subtags: ISubtagToken[];
}

export interface ISubtagToken extends IToken {
    name: IStringToken;
    args: IStringToken[];
}