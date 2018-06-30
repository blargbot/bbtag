import { BBString, BBSubTag } from '../language';
import { Context } from './context';
import { Engine } from '../engine';
import { Condition } from './subtag.conditions';
import * as conditions from './subtag.conditions';
import * as errors from './subtag.errors';
import { IDatabase } from '../interfaces/idatabase';

function ensureArray(value?: string | string[]): string[] {
    if (Array.isArray(value))
        return value;
    if (value)
        return [value];
    return [];
}

export abstract class SubTag<TContext extends Context> {
    public static readonly conditions = conditions;
    public static readonly errors = errors;
    public static readonly defaultCategory = 'System';

    protected readonly rules: SubTagRule<TContext>[] = [];

    public readonly context: new (...args: any[]) => TContext;
    public readonly engine: Engine;
    public readonly database: IDatabase;
    public readonly name: string;
    public readonly category: string;
    public readonly globalNames?: string[];
    public readonly aliases: string[];

    public readonly errors = SubTag.errors;
    public readonly conditions = SubTag.conditions;

    protected constructor(engine: Engine, name: string, options: BaseSubtagOptions<TContext>) {
        this.context = options.context;
        this.engine = engine;
        this.database = this.engine.database;
        this.name = name;

        this.category = options.category || 'System';
        this.aliases = ensureArray(options.alias);
        this.globalNames = ensureArray(options.globalName);
    }

    protected whenArgs(condition: Condition, handler: SubTagHandler<TContext>): this {
        this.rules.push({ condition: condition.bind(this), handler: handler.bind(this) });
        return this;
    }

    protected async parseArgs(subtag: BBSubTag, context: TContext, positions?: number | number[]): Promise<string[]> {
        if (positions === undefined)
            positions = [...new Array(subtag.args.length).keys()];
        else if (!Array.isArray(positions))
            positions = [positions];

        let promises = positions.map(position => this.engine.execute(subtag.args[position], context));
        return await Promise.all(promises);
    }

    public async execute(subtag: BBSubTag, context: TContext): Promise<string> {
        let handler: SubTagHandler<TContext> | undefined;
        for (const rule of this.rules) {
            if (await rule.condition(subtag)) {
                handler = rule.handler.bind(this);
                break;
            }
        }
        if (handler === undefined)
            throw new MissingHandlerError(this, subtag);

        let result = await handler(subtag, context);
        switch (typeof result) {
            case 'function': return await (<SubTagError>result)(subtag, context);
            case 'string': return <string>result;
            case 'number': return String(result);
            case 'boolean': return String(result);
            case 'object': return JSON.stringify(result);
            default: return '';
        }
    }
}

export abstract class SystemSubTag extends SubTag<Context> {
    constructor(engine: Engine, name: string, options?: SubTagOptions) {
        let _options = <BaseSubtagOptions<Context>>options || {};
        _options.context = Context;
        super(engine, name, _options);
    }
}

export class MissingHandlerError<TContext extends Context> extends Error {
    public subtag: SubTag<TContext>;
    public part: BBSubTag;

    constructor(subtag: SubTag<TContext>, part: BBSubTag) {
        super(`Missing handler on ${subtag.name} for ${JSON.stringify(part.args)}`);
        this.subtag = subtag;
        this.part = part;
    }
}

export type BaseSubtagOptions<TContext> = SubTagOptions & { context: new (...args: any[]) => TContext };
export type SubTagHandler<TContext> = (subtag: BBSubTag, context: TContext) => SubTagResult;
export type SubTagRule<TContext> = { condition: Condition, handler: SubTagHandler<TContext> };
export type SubTagError = (part: BBString | BBSubTag, context: Context) => Promise<string>;
export type SubTagResult = Promise<void | string | boolean | number | Array<string | number> | SubTagError>;
export interface SubTagOptions {
    alias?: string | string[],
    category?: string,
    globalName?: string | string[]
}
