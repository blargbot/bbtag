export function tag(name: any, ...args: any[]): any {
    return { name, args };
}

export function str(format: string, ...subtags: any[]): any {
    return { format, subtags };
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