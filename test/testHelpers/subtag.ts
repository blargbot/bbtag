import { IStringToken, ISubtagError, ISubtagToken, SubtagPrimitiveResult, SubtagResultArray } from '../../src/language';
import { ExecutionContext } from '../../src/structures';
import { Position, Range } from '../../src/util';
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

export function err(message: string, token: IStringToken | ISubtagToken, context: ExecutionContext): ISubtagError {
    return { message, token, context };
}

export function ctx(setup: (context: ExecutionContext) => any = () => { }): ExecutionContext {
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