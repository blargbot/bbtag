import util from '../util';
import { Enumerable } from '../util/enumerable';
import { IStringToken, ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagError } from './errors';
import { SubtagResult } from './subtagArguments';
import { createSubtagResult, StringExecutionResult, SubtagExecutionResult } from './subtagResults';

type SubtagConditionFunc = (args: IStringToken[]) => boolean;
type SubtagHandler<T, TSelf> = (this: TSelf, context: T, token: ISubtagToken, args: IStringToken[], resolved: StringExecutionResult[]) => Promise<SubtagResult> | SubtagResult;
type SubtagCondition = SubtagConditionFunc | string | number;
// tslint:disable-next-line: interface-over-type-literal
type SubtagConditionParser = { regex: RegExp, parser: (match: RegExpExecArray) => Exclude<SubtagCondition, string> | undefined };
// tslint:disable-next-line: interface-over-type-literal
type SubtagConditionalHandler<T, TSelf> = { condition: SubtagConditionFunc, handler: SubtagHandler<T, TSelf>, autoResolve: Set<number> };
const defaultParsers: SubtagConditionParser[] = [];

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Promise<SubtagExecutionResult> | SubtagExecutionResult;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
}

export interface ISubtagArguments<TContext extends SubtagContext> {
    name: string;
    aliases?: Set<string> | string[] | Iterable<string> | Enumerable<string>;
    contextType: new (...args: any[]) => TContext;
}

export abstract class Subtag<T extends ExecutionContext> implements ISubtag<T> {
    protected static readonly conditionParseHandlers: SubtagConditionParser[] = defaultParsers;
    public readonly contextType: new (...args: any[]) => T;
    public readonly name: string;
    public readonly aliases: Set<string>;
    private readonly _conditionals: Array<SubtagConditionalHandler<T, this>>;
    private _defaultHandler?: SubtagConditionalHandler<T, this>;

    protected constructor(args: ISubtagArguments<T>) {
        this.contextType = args.contextType;
        this.name = args.name;
        this.aliases = Enumerable.from(args.aliases as any || []).toSet();
        this._conditionals = [];
    }

    public async execute(token: ISubtagToken, context: T): Promise<SubtagExecutionResult> {
        let action;
        let autoResolve: Set<number> | undefined;
        for (const { condition, handler, autoResolve: ar } of this._conditionals) {
            if (condition(token.args)) {
                action = handler;
                autoResolve = ar;
                break;
            }
        }

        if (action === undefined && this._defaultHandler !== undefined) {
            action = this._defaultHandler.handler;
            autoResolve = this._defaultHandler.autoResolve;
        }

        if (action === undefined || autoResolve === undefined) {
            return createSubtagResult(new SubtagError(`Missing handler for execution of subtag {${[this.name, ...token.args.map(a => '')].join(';')}}`, token));
        }

        try {
            const resolved: StringExecutionResult[] = [];
            const args: IStringToken[] = [];
            for (let i = 0; i < token.args.length; i++) {
                if (autoResolve.has(i)) {
                    resolved.push(await context.execute(token.args[i]));
                } else {
                    args.push(token.args[i]);
                }
            }
            return createSubtagResult(await action.call(this, context, token, args, resolved));
        } catch (ex) {
            if (!(ex instanceof Error)) {
                return createSubtagResult(new SubtagError('' + ex, token));
            } else if (!(ex instanceof SubtagError)) {
                return createSubtagResult(new SubtagError(ex, token));
            } else {
                return createSubtagResult(ex);
            }
        }
    }

    public optimize(token: ISubtagToken, context: OptimizationContext): ISubtagToken | string {
        return token;
    }

    public toString(): string {
        return `{${this.name}}`;
    }

    protected fakeArgument(format: string, subtags?: ISubtagToken[]): IStringToken {
        return {
            format,
            subtags: subtags || [],
            range: undefined!
        };
    }

    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: number[] = []): this {
        switch (typeof condition) {
            case 'number': return this.whenArgs(args => args.length === condition, handler, autoResolve);
            case 'string': return this.whenArgs(this.parseCondition(condition as string), handler, autoResolve);
            case 'function': this._conditionals.push({ condition: condition as SubtagConditionFunc, handler: handler.bind(this as any), autoResolve: new Set(autoResolve) });
        }
        return this;
    }

    protected default(handler: SubtagHandler<T, this>, autoResolve: number[] = []): this {
        this._defaultHandler = { condition: () => true, handler: handler.bind(this as any), autoResolve: new Set(autoResolve) };
        return this;
    }

    protected parseCondition(condition: string): Exclude<SubtagCondition, string> {
        const asNumber = util.serialization.number.tryDeserialize(condition);
        if (asNumber.success) {
            return asNumber.value;
        }

        for (const { regex, parser } of Subtag.conditionParseHandlers) {
            regex.lastIndex = 0;
            const match = regex.exec(condition);
            if (match !== null) {
                const parsed = parser(match);
                if (parsed !== undefined) {
                    return parsed;
                }
            }
        }
        throw new Error(`Unable to parse condition '${condition}'`);
    }
}

defaultParsers.push(
    {
        regex: /^\s*?(<=?|>=?|={1,3}|!={0,2})\s*?(\d+)\s*?$/, //
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const num = util.serialization.number.deserialize(match[2]);
            switch (match[1]) {
                case '>': return args => args.length > num;
                case '>=': return args => args.length >= num;
                case '<': return args => args.length < num;
                case '<=': return args => args.length <= num;
                case '!':
                case '!=':
                case '!==': return args => args.length !== num;
                case '=':
                case '==':
                case '===': return args => args.length === num;
            }
        }
    }, {
        regex: /^\s*?(\d+)(!?)\s*?-\s*?(\d+)(!?)\s*?$/, // Matches anything of the form '1!-5!' (1 to 5 exclusive) or '1-5' (1 to 5 inclusive)
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            let from = util.serialization.number.deserialize(match[1]);
            let to = util.serialization.number.deserialize(match[3]);
            const includeFrom = !match[2];
            const includeTo = !match[4];
            if (from > to) {
                from = [to, to = from][0];
            }
            switch (toNumber(includeFrom, includeTo)) {
                case toNumber(true, true): return args => from <= args.length && args.length <= to;
                case toNumber(false, true): return args => from < args.length && args.length <= to;
                case toNumber(true, false): return args => from <= args.length && args.length < to;
                case toNumber(false, false): return args => from < args.length && args.length < to;
            }
        }
    }, {
        regex: /^\s*?\d+(?:\s*?,\s*?\d+)+\s*?$/, // Matches anything of the form '1, 2, 3, 4' etc
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const counts: number[] = Array.from(match[0].match(/\d+/g) || [], util.serialization.number.deserialize);
            return args => counts.indexOf(args.length) !== -1;
        }
    }
);

function toNumber(...values: boolean[]): number {
    let result = 0;
    let mult = 1;
    for (const bool of values) {
        result |= (bool as any as number) * mult;
        mult *= 2;
    }

    return result;
}