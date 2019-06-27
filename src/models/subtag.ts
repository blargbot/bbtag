import { default as util } from '../util';
import { Enumerable } from '../util/enumerable';
import { IStringToken, ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagError } from './errors';
import { conditionParsers, SubtagConditionFunc, SubtagConditionParser, SubtagCondition } from '../util/conditions';

type SubtagHandler<T, TSelf> = (this: TSelf, context: T, token: ISubtagToken, args: IStringToken[], resolved: SubtagResult[]) => Promise<SubtagResult> | SubtagResult;
// tslint:disable-next-line: interface-over-type-literal
type SubtagConditionalHandler<T, TSelf> = { condition: SubtagConditionFunc, handler: SubtagHandler<T, TSelf>, autoResolve: Set<number> };

export type SubtagPrimativeResult = undefined | string | number | boolean;
export type SubtagResult = SubtagPrimativeResult | SubtagPrimativeResult[] | SubtagError;

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Promise<SubtagResult> | SubtagResult;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
}

export interface ISubtagArguments<TContext extends SubtagContext> {
    name: string;
    aliases?: Set<string> | string[] | Iterable<string> | Enumerable<string>;
    contextType: new (...args: any[]) => TContext;
}

export abstract class Subtag<T extends ExecutionContext> implements ISubtag<T> {
    protected static readonly conditionParseHandlers: SubtagConditionParser[] = conditionParsers;
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

    public async execute(token: ISubtagToken, context: T): Promise<SubtagResult> {
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
            return new SubtagError(`Missing handler for execution of subtag {${[this.name, ...token.args.map(a => '')].join(';')}}`, token);
        }

        try {
            const resolved: SubtagResult[] = [];
            const args: IStringToken[] = [];
            for (let i = 0; i < token.args.length; i++) {
                if (autoResolve.has(i)) {
                    resolved.push(await context.execute(token.args[i]));
                } else {
                    args.push(token.args[i]);
                }
            }
            return await action.call(this, context, token, args, resolved);
        } catch (ex) {
            if (!(ex instanceof Error)) {
                return new SubtagError('' + ex, token);
            } else if (!(ex instanceof SubtagError)) {
                return new SubtagError(ex, token);
            } else {
                return ex;
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