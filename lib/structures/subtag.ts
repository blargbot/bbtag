import bbtag, { ISubtagToken, SubtagCondition, SubtagConditionFunc, SubtagResult } from '../bbtag';
import { Awaitable, Constructor, Enumerable, functions } from '../util';
import { argumentBuilder, SubtagArgumentDefinition } from './argumentBuilder';
import { ArgumentCollection } from './argumentCollection';
import { OptimizationContext, SubtagContext } from './context';

type SubtagHandler<T extends SubtagContext, TSelf extends Subtag<T>> = (this: TSelf, args: ArgumentCollection<T>) => Awaitable<SubtagResult>;
type PreExecute<T extends SubtagContext> = (context: T, args: ArgumentCollection<T>) => Awaitable<void>;
type AutoResolvable<T extends SubtagContext> = Iterable<number> | PreExecute<T> | boolean;

interface ISubtagConditionalHandler<T extends SubtagContext, TSelf extends Subtag<T>> {
    condition: SubtagConditionFunc;
    handler: SubtagHandler<T, TSelf>;
    preExecute: PreExecute<T>;
}

export interface ISubtag<T extends SubtagContext> {
    readonly context: Constructor<T>;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: T): Awaitable<SubtagResult>;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
    toString(): string;
}

interface IUsageExample { code: string; arguments?: string[]; output: string; effects?: string; }

export interface ISubtagArgs<TContext extends SubtagContext> {
    name: string;
    category: string;
    aliases?: Iterable<string>;
    arguments: Iterable<SubtagArgumentDefinition>;
    description: string | ((context: TContext) => string);
    examples?: Iterable<IUsageExample>;
    arraySupport?: boolean;
}

export abstract class Subtag<T extends SubtagContext> implements ISubtag<T> {
    public readonly context: Constructor<T>;
    public readonly name: string;
    public readonly category: string;
    public readonly aliases: Set<string>;
    public readonly description: (context: T) => string;
    public readonly arguments: SubtagArgumentDefinition[];
    public readonly examples?: IUsageExample[];
    public readonly arraySupport: boolean;

    private readonly _conditionals: Array<ISubtagConditionalHandler<T, this>>;
    private _defaultHandler?: ISubtagConditionalHandler<T, this>;

    protected constructor(context: Constructor<T>, args: ISubtagArgs<T>) {
        this.context = context;
        this.name = args.name;
        this.category = args.category;
        this.aliases = Enumerable.from(args.aliases || []).toSet();
        this.description = typeof args.description === 'string' ? () => args.description as string : args.description;
        this.arguments = Enumerable.from(args.arguments).toArray();
        this.examples = Enumerable.from(args.examples || []).toArray();
        this.arraySupport = args.arraySupport || false;

        this._conditionals = [];
    }

    public [Symbol.toStringTag](): string {
        return this.toString();
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
            return bbtag.errors.system.unknownHandler(context, token, this);
        }

        const args = new ArgumentCollection(context, token);
        if (preExecute !== undefined) {
            await preExecute(context, args);
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

    protected whenArgs(condition: SubtagCondition, handler: SubtagHandler<T, this>, autoResolve?: AutoResolvable<T>): this {
        switch (typeof condition) {
            case 'number': return this.whenArgs(args => args.length === condition, handler, autoResolve);
            case 'string': return this.whenArgs(bbtag.conditions.parse(condition), handler, autoResolve);
        }

        this._conditionals.push({
            condition,
            handler: handler.bind(this as ThisParameterType<SubtagHandler<T, this>>),
            preExecute: toFunction(autoResolve)
        });

        return this;
    }

    protected default(handler: SubtagHandler<T, this>, autoResolve?: AutoResolvable<T>): this {
        return this.whenArgs(functions.true, handler, autoResolve);
    }
}

function toFunction<T extends SubtagContext>(preExecute?: Iterable<number> | PreExecute<T> | boolean): PreExecute<T> {
    switch (typeof preExecute) {
        case 'function': return preExecute;
        case 'boolean': return (_, args) => functions.blank(args.executeAll());
        case 'undefined': return toFunction<T>(false);
    }

    const enumerable = Enumerable.from(preExecute);

    return (_, args) => functions.blank(Promise.all(enumerable.select(index => args.execute(index))));
}