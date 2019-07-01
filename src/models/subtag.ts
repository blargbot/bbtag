import { default as util } from '../util';
import { Enumerable } from '../util/enumerable';
import { IStringToken, ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagError } from './errors';
import { conditionParsers, SubtagConditionFunc, SubtagConditionParser, SubtagCondition } from '../util/conditions';
import { SubtagArgumentDefinition } from './subtagArguments';
import { Awaitable } from './awaitable';

type SubtagHandler<T, TSelf> = (this: TSelf, context: T, token: ISubtagToken, args: IStringToken[], resolved: SubtagResult[]) => Awaitable<SubtagResult>;
// tslint:disable-next-line: interface-over-type-literal
type SubtagConditionalHandler<T, TSelf> = { condition: SubtagConditionFunc, handler: SubtagHandler<T, TSelf>, autoResolve: AutoResolve };
type AutoResolve = (value: IStringToken, index: number) => boolean;
export type SubtagPrimativeResult = void | null | undefined | string | number | boolean;
export type SubtagResult = SubtagPrimativeResult | SubtagPrimativeResult[] | SubtagError;

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Awaitable<SubtagResult>;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
}

interface IUsageExample { code: string; arguments?: string[]; output: string; effects?: string; }

export interface ISubtagArguments<TContext extends SubtagContext> {
    contextType: new (...args: any[]) => TContext;
    name: string;
    category: string;
    aliases?: Iterable<string>;
    arguments: Iterable<SubtagArgumentDefinition>;
    description: string;
    examples?: Iterable<IUsageExample>;
    arraySupport?: boolean;
}

export abstract class Subtag<T extends ExecutionContext> implements ISubtag<T> {
    protected static readonly conditionParseHandlers: SubtagConditionParser[] = conditionParsers;

    public readonly contextType: new (...args: any[]) => T;
    public readonly name: string;
    public readonly category: string;
    public readonly aliases: Set<string>;
    public readonly description: string;
    public readonly arguments: SubtagArgumentDefinition[];
    public readonly examples?: IUsageExample[];
    public readonly arraySupport: boolean;

    private readonly _conditionals: Array<SubtagConditionalHandler<T, this>>;
    private _defaultHandler?: SubtagConditionalHandler<T, this>;

    protected constructor(args: ISubtagArguments<T>) {
        this.contextType = args.contextType;
        this.name = args.name;
        this.category = args.category;
        this.aliases = Enumerable.from(args.aliases || []).toSet();
        this.description = args.description;
        this.arguments = Enumerable.from(args.arguments).toArray();
        this.examples = Enumerable.from(args.examples || []).toArray();
        this.arraySupport = args.arraySupport || false;

        this._conditionals = [];
    }

    public async execute(token: ISubtagToken, context: T): Promise<SubtagResult> {
        let action;
        let autoResolve: undefined | ((value: IStringToken, index: number) => boolean);
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
            return context.error(`Missing handler for execution of subtag {${[this.name, ...token.args.map(a => '')].join(';')}}`, token);
        }

        try {
            const resolved: SubtagResult[] = [];
            const args: IStringToken[] = [];
            for (let i = 0; i < token.args.length; i++) {
                if (autoResolve(token.args[i], i)) {
                    resolved.push(await context.execute(token.args[i]));
                } else {
                    args.push(token.args[i]);
                }
            }
            return await action.call(this, context, token, args, resolved);
        } catch (ex) {
            if (!(ex instanceof Error)) {
                return context.error('' + ex, token);
            } else if (!(ex instanceof SubtagError)) {
                return context.error(ex, token);
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

    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: Iterable<number>): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: AutoResolve): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: boolean): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve?: Iterable<number> | AutoResolve | boolean): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, Subtag<T>>, autoResolve?: Iterable<number> | AutoResolve | boolean): this {
        switch (typeof condition) {
            case 'number': return this.whenArgs(args => args.length === condition, handler, autoResolve);
            case 'string': return this.whenArgs(this.parseCondition(condition), handler, autoResolve);
            case 'function': this._conditionals.push({ condition, handler: handler.bind(this), autoResolve: toFunction(autoResolve) });
        }
        return this;
    }

    protected default(handler: SubtagHandler<T, this>): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: Iterable<number>): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: AutoResolve): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: boolean): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve?: Iterable<number> | AutoResolve | boolean): this;
    protected default(handler: SubtagHandler<T, Subtag<T>>, autoResolve?: Iterable<number> | AutoResolve | boolean): this {
        this._defaultHandler = { condition: () => true, handler: handler.bind(this), autoResolve: toFunction(autoResolve) };
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

function toFunction(autoResolve?: Iterable<number> | AutoResolve | boolean): AutoResolve {
    switch (typeof autoResolve) {
        case 'function': return autoResolve;
        case 'boolean': return () => autoResolve;
        case 'undefined': return () => false;
    }

    const enumerable = Enumerable.from(autoResolve);

    return (_, i) => enumerable.any(e => e === i);
}