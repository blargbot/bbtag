import { Awaitable, default as util } from '../util';
import { conditionParsers, SubtagCondition, SubtagConditionFunc, SubtagConditionParser } from '../util/conditions';
import { Enumerable } from '../util/enumerable';
import { ArgumentCollection } from './argumentCollection';
import { SubtagArgumentDefinition } from './arguments';
import { ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagError } from './errors';

type SubtagHandler<T extends ExecutionContext, TSelf> = (this: TSelf, args: ArgumentCollection<T>) => Awaitable<SubtagResult>;
// tslint:disable-next-line: interface-over-type-literal
type SubtagConditionalHandler<T extends ExecutionContext, TSelf> = { condition: SubtagConditionFunc, handler: SubtagHandler<T, TSelf>, preExecute: PreExecute<T> };
type PreExecute<T extends ExecutionContext> = (args: ArgumentCollection<T>) => Awaitable;
export type SubtagPrimativeResult = void | null | undefined | string | number | boolean;
export type SubtagResult = SubtagPrimativeResult | SubtagPrimativeResult[] | SubtagError;

export interface ISubtag<TContext extends ExecutionContext> {
    readonly context: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Awaitable<SubtagResult>;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
}

interface IUsageExample { code: string; arguments?: string[]; output: string; effects?: string; }

export interface ISubtagOptions<TContext extends SubtagContext> {
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

    public readonly context: new (...args: any[]) => T;
    public readonly name: string;
    public readonly category: string;
    public readonly aliases: Set<string>;
    public readonly description: string;
    public readonly arguments: SubtagArgumentDefinition[];
    public readonly examples?: IUsageExample[];
    public readonly arraySupport: boolean;

    private readonly _conditionals: Array<SubtagConditionalHandler<T, this>>;
    private _defaultHandler?: SubtagConditionalHandler<T, this>;

    protected constructor(args: ISubtagOptions<T>) {
        this.context = args.contextType;
        this.name = args.name;
        this.category = args.category;
        this.aliases = Enumerable.from(args.aliases || []).toSet();
        this.description = args.description;
        this.arguments = Enumerable.from(args.arguments).toArray();
        this.examples = Enumerable.from(args.examples || []).toArray();
        this.arraySupport = args.arraySupport || false;

        this._conditionals = [];
    }

    public execute(token: ISubtagToken, context: T): Awaitable<SubtagResult>;
    public async execute(token: ISubtagToken, context: T): Promise<SubtagResult> {
        let action;
        let preExecute: undefined | PreExecute<T>;
        for (const { condition, handler, preExecute: pre } of this._conditionals) {
            if (condition(token.args)) {
                action = handler;
                preExecute = pre;
                break;
            }
        }

        if (action === undefined && this._defaultHandler !== undefined) {
            action = this._defaultHandler.handler;
            preExecute = this._defaultHandler.preExecute;
        }

        if (action === undefined) {
            return context.error(`Missing handler for execution of subtag {${[this.name, ...token.args.map(_ => '')].join(';')}}`, token);
        }

        try {
            const args = new ArgumentCollection(context, token);
            if (preExecute !== undefined) {
                await preExecute(args);
            }
            return await action.call(this, args);
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

    public optimize(token: ISubtagToken, _context: OptimizationContext): ISubtagToken | string {
        return token;
    }

    public toString(): string {
        return `{${this.name}}`;
    }

    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: Iterable<number>): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: PreExecute<T>): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve: boolean): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve?: Iterable<number> | PreExecute<T> | boolean): this;
    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, Subtag<T>>, autoResolve?: Iterable<number> | PreExecute<T> | boolean): this {
        switch (typeof condition) {
            case 'number': return this.whenArgs(args => args.length === condition, handler, autoResolve);
            case 'string': return this.whenArgs(this.parseCondition(condition), handler, autoResolve);
            case 'function': this._conditionals.push({ condition, handler: handler.bind(this), preExecute: toFunction(autoResolve) });
        }
        return this;
    }

    protected default(handler: SubtagHandler<T, this>): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: Iterable<number>): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: PreExecute<T>): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve: boolean): this;
    protected default(handler: SubtagHandler<T, this>, autoResolve?: Iterable<number> | PreExecute<T> | boolean): this;
    protected default(handler: SubtagHandler<T, Subtag<T>>, autoResolve?: Iterable<number> | PreExecute<T> | boolean): this {
        this._defaultHandler = { condition: () => true, handler: handler.bind(this), preExecute: toFunction(autoResolve) };
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

function toFunction<T extends ExecutionContext>(preExecute?: Iterable<number> | PreExecute<T> | boolean): PreExecute<T> {
    switch (typeof preExecute) {
        case 'function': return preExecute;
        case 'boolean': return args => args.executeAll();
        case 'undefined': return toFunction<T>(false);
    }

    const enumerable = Enumerable.from(preExecute);

    return args => Promise.all(enumerable.select(index => args.execute(index)));
}