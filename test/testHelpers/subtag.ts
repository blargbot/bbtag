import { IStringToken, ISubtagError, ISubtagToken, Position, Range, SubtagContext, SubtagPrimitiveResult, SubtagResult, SubtagResultArray } from '../..';
import { MockExecutionContext } from './mocks';

const range = new Range(new Position(0, 0, 0), new Position(0, 0, 0));

export function tag(name: IStringToken, ...args: IStringToken[]): ISubtagToken {
    return { name, args, range };
}

export function str(format: string, ...subtags: ISubtagToken[]): IStringToken {
    return { format, subtags, range };
}

export function arr(values: SubtagPrimitiveResult[], name?: string): SubtagResultArray;
export function arr(values: SubtagResultArray, name?: string): SubtagResultArray {
    values.name = name;
    return values;
}

export function err(message: string, token: IStringToken | ISubtagToken, context: SubtagContext): ISubtagError {
    return { message, token, context };
}

export function ctx(setup: (context: SubtagContext) => any = () => { }): SubtagContext {
    const result = new MockExecutionContext();
    setup(result);
    return result;
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

export function toName(value: SubtagResult): string {
    switch (typeof value) {
        case 'number': return '' + value;
        case 'object': if (value !== null && !Array.isArray(value)) {
            return `[${'format' in value.token ? 'STR' : 'SUB'} ERROR '${value.message}']`;
        }
    }

    return JSON.stringify(value);
}