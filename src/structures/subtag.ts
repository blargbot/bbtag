import { OptimizationContext, SubtagContext } from '../contexts';
import { ISubtagToken, SubtagResult } from '../language';
import { Awaitable, Enumerable } from '../util';
import { conditionParsers, SubtagCondition, SubtagConditionFunc, SubtagConditionParser } from '../util/conditions';
import { argumentBuilder, SubtagArgumentDefinition } from './argumentBuilder';
import { ArgumentCollection } from './argumentCollection';

type SubtagHandler<T extends SubtagContext, TSelf extends Subtag<T>> = (this: TSelf, args: ArgumentCollection<T>) => Awaitable<SubtagResult>;
type PreExecute<T extends SubtagContext> = (args: ArgumentCollection<T>, context: T) => Awaitable<void>;
type AutoResolvable<T extends SubtagContext> = Iterable<number> | PreExecute<T> | boolean;

interface ISubtagConditionalHandler<T extends SubtagContext, TSelf extends Subtag<T>> {
    condition: SubtagConditionFunc;
    handler: SubtagHandler<T, TSelf>;
    preExecute: PreExecute<T>;
}

export interface ISubtag<TContext extends SubtagContext> {
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

export abstract class Subtag<TContext extends SubtagContext> implements ISubtag<TContext> {
    protected static readonly conditionParseHandlers: SubtagConditionParser[] = conditionParsers;

    public readonly context: new (...args: any[]) => TContext;
    public readonly name: string;
    public readonly category: string;
    public readonly aliases: Set<string>;
    public readonly description: string;
    public readonly arguments: SubtagArgumentDefinition[];
    public readonly examples?: IUsageExample[];
    public readonly arraySupport: boolean;

    private readonly _conditionals: Array<ISubtagConditionalHandler<TContext, this>>;
    private _defaultHandler?: ISubtagConditionalHandler<TContext, this>;

    protected constructor(args: ISubtagOptions<TContext>) {
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

    public execute(token: ISubtagToken, context: TContext): Awaitable<SubtagResult>;
    public async execute(token: ISubtagToken, context: TContext): Promise<SubtagResult> {
        let action;
        let preExecute: undefined | PreExecute<TContext>;
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
            return context.error(token, `Missing handler for execution of subtag {${[this.name, ...token.args.map(_ => '')].join(';')}}`);
        }

        const args = new ArgumentCollection(context, token);
        if (preExecute !== undefined) {
            await preExecute(args, context);
        }
        return action.call(this, args);
    }

    public optimize(token: ISubtagToken, _context: OptimizationContext): ISubtagToken | string {
        return token;
    }

    public toString(): string {
        if (this.arguments.length === 0) {
            return `{${this.name}}`;
        }
        return `{${this.name};${argumentBuilder.stringify(';', this.arguments)}}`;
    }

    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<TContext, this>, autoResolve?: AutoResolvable<TContext>): this {
        switch (typeof condition) {
            case 'number': return this.whenArgs(args => args.length === condition, handler, autoResolve);
            case 'string': return this.whenArgs(this.parseCondition(condition), handler, autoResolve);
            case 'function': this._conditionals.push({ condition, handler: handler.bind(this), preExecute: toFunction(autoResolve) });
        }
        return this;
    }

    protected default(handler: SubtagHandler<TContext, this>, autoResolve?: AutoResolvable<TContext>): this {
        this._defaultHandler = { condition: () => true, handler: handler.bind(this), preExecute: toFunction(autoResolve) };
        return this;
    }

    protected parseCondition(condition: string): Exclude<SubtagCondition, string> {
        const asNumber = Number(condition);
        if (!isNaN(asNumber)) {
            return asNumber;
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

function toFunction<T extends SubtagContext>(preExecute?: Iterable<number> | PreExecute<T> | boolean): PreExecute<T> {
    switch (typeof preExecute) {
        case 'function': return preExecute;
        case 'boolean': return args => voidResult(args.executeAll());
        case 'undefined': return toFunction<T>(false);
    }

    const enumerable = Enumerable.from(preExecute);

    return args => voidResult(Promise.all(enumerable.select(index => args.execute(index))));
}

function voidResult(values: Awaitable<any>): Awaitable<void> {
    return values;
}