import { Range } from './range';

export interface Token {
    range: Range;
}

export interface BBTag {
    source: string;
    root: StringToken;
}

export interface StringToken extends Token {
    format: string;
    subtags: SubtagToken[];
}

export interface SubtagToken extends Token {
    name: StringToken;
    args: StringToken[];
}