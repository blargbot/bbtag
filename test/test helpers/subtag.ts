import { IStringToken, ISubtagToken, Range } from '../../src/structures';

export function tag(name: IStringToken, ...args: IStringToken[]): ISubtagToken {
    return { name, args, range: Range.empty };
}

export function str(format: string, ...subtags: ISubtagToken[]): IStringToken {
    return { format, subtags, range: Range.empty };
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