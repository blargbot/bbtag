import {
    Engine, IDatabase, IStringToken, ISubtagError, ISubtagToken,
    SubtagContext, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, TokenRange
} from '../..';
import { MockDatabase } from './mocks';

const range: TokenRange = TokenRange.from('[0:0:0]:[0:0:0]'); // new Range(new Position(0, 0, 0), new Position(0, 0, 0));

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

export function db(setup: (db: MockDatabase) => any = () => { }): IDatabase {
    const result = new MockDatabase();
    setup(result);
    return result;
}

export function eng(): Engine<SubtagContext>;
export function eng(context: undefined, database?: IDatabase): Engine<SubtagContext>;
export function eng<T extends SubtagContext>(context: T, database?: IDatabase): Engine<T>;
export function eng(context: any = SubtagContext, database: IDatabase = db()): Engine<any> {
    return new Engine(context, database);
}

export function ctx(): SubtagContext;
export function ctx(setup: (context: SubtagContext) => any): SubtagContext;
export function ctx(engine: Engine<SubtagContext>): SubtagContext;
export function ctx(engine: Engine<SubtagContext>, setup: (context: SubtagContext) => any): SubtagContext;
export function ctx(...args:
    [] |
    [(context: SubtagContext) => any] |
    [Engine<SubtagContext>] |
    [Engine<SubtagContext>, (context: SubtagContext) => any]
): SubtagContext {
    if (args.length === 2) { return _ctx(...args); }
    if (args.length === 0) { return _ctx(eng()); }
    if (args[0] instanceof Engine) { return _ctx(args[0]); }
    return _ctx(undefined, args[0]);
}

function _ctx(engine: Engine<SubtagContext> = eng(), setup: (context: SubtagContext) => any = () => { }): SubtagContext {
    const result = new SubtagContext(engine, { name: 'test', scope: 'test' });
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