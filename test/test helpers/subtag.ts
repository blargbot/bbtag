import { IStringToken, ISubtagToken, Position, Range } from '../../src/structures';

const range = new Range(new Position(0, 0, 0), new Position(0, 0, 0));

export function tag(name: IStringToken, ...args: IStringToken[]): ISubtagToken {
    return { name, args, range };
}

export function str(format: string, ...subtags: ISubtagToken[]): IStringToken {
    return { format, subtags, range };
}

export function stripStrToken(token: any): any {
    return {
        format: token.format,
        subtags: token.subtags.map(stripTagToken)
    };
}

export function stripTagToken(token: any): any {
    return {
        name: stripStrToken(token.name),
        args: token.args.map(stripStrToken)
    };
}