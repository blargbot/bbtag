import { BBString, BBSubTag, BBSource } from '../language';
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

    protected namedArgs: NamedArgument[] = [];

    protected constructor(engine: Engine, name: string, options: BaseSubtagOptions<TContext>) {
        this.context = options.context;
        this.engine = engine;
        this.database = this.engine.database;
        this.name = name;

        this.category = options.category || 'System';
        this.aliases = ensureArray(options.alias);
        this.globalNames = ensureArray(options.globalName);
    }

    protected setNamedArgs(namedArgs: NamedArgument[]) {
        this.namedArgs = namedArgs;
    }

    protected whenArgs(condition: Condition, handler: SubTagHandler<TContext>): this {
        this.rules.push({ condition: condition.bind(this), handler: handler.bind(this) });
        return this;
    }

    protected async parseArg(subtag: BBSubTag, context: TContext, position: number): Promise<string> {
        let result = await this.parseArgs(subtag, context, position);
        return result[0];
    }

    protected async parseArgs(subtag: BBSubTag, context: TContext, positions?: number | number[]): Promise<string[]> {
        if (positions === undefined)
            positions = [...new Array(subtag.args.length).keys()];
        else if (!Array.isArray(positions))
            positions = [positions];

        let promises = positions.filter(v => v in subtag.args)
            .map(position => this.engine.execute(subtag.args[position], context));
        return await Promise.all(promises);
    }

    protected async parseNamedArg(subtag: BBSubTag, context: TContext, name: string) {
        let result = await this.parseNamedArgs(subtag, context, name);
    }

    protected async parseNamedArgs(subtag: BBSubTag, context: TContext, name?: string | string[], raw?: RawArguments) {
        let rawArgs: RawArguments;
        if (raw) rawArgs = raw;
        else rawArgs = await this.mapNamedArgs(subtag, context);

        let args: { [name: string]: string | string[] } = {};
        let names: string[];
        if (name === undefined) {
            names = this.namedArgs.map(a => a.key);
        }
        if (Array.isArray(name)) names = name;
        else names = [<string>name];

        for (const key in rawArgs) {
            if (names.indexOf(key) > -1) {
                let arg = rawArgs[key];
                if (Array.isArray(arg)) {
                    let arr = [];
                    for (const p of arg)
                        arr.push(await this.engine.execute(p, context));
                    args[key] = arr;
                } else {
                    args[key] = await this.engine.execute(arg, context);
                }
            }
        }

        return { raw: rawArgs, args };
    }

    private async mapNamedArgs(subtag: BBSubTag, context: TContext) {
        let rawArgs: { [name: string]: BBString | BBString[] } = {};
        if (subtag.named) { // map named args
            let parts = subtag.args[0].parts;
            for (const part of parts) {
                if (part instanceof BBSubTag) {
                    if (part.keyValue && part.name) {
                        let key = await this.engine.execute(part.name, context);
                        key = key.substring(1); // remove * prefix
                        let args = this.namedArgs.filter(na => na.key === key);
                        if (args.length > 0) {
                            if (args[0].repeated) {
                                let arg = rawArgs[key];
                                if (arg === undefined)
                                    arg = [];
                                else if (!Array.isArray(arg))
                                    arg = [arg];
                                arg.push(part.args[0]);
                                rawArgs[key] = arg;
                            } else
                                rawArgs[key] = part.args[0];
                        }
                    } else {
                        throw new InvalidNamedArgumentError(this, part);
                    }
                }
            }
        } else { // map positional args
            let i = 0;
            let r = []
            for (let ii = 0; ii < this.namedArgs.length; ii++) {
                let arg = this.namedArgs[ii];
                let part = subtag.args[i];
                let remainingArgs = this.namedArgs.length - ii;
                let remainingParts = subtag.args.length - i;
                let optional = arg.optional === true;
                let repeated = arg.repeated === true;

                if (repeated) {
                    let minLength = optional ? 0 : 1;
                    console.log('repeated arg', i, minLength, remainingParts, remainingArgs);
                    let temp = subtag.args.slice(i, i + Math.max(minLength, remainingParts - remainingArgs + 1));
                    rawArgs[arg.key] = temp;
                    i += temp.length;
                    console.log('finished arg', i, temp.length, remainingParts, remainingArgs);

                } else {
                    if (!optional) {
                        if (!part) throw new NotEnoughArgumentsError(this, subtag);
                        rawArgs[arg.key] = part;
                        i++;
                    } else {
                        if (remainingParts >= remainingArgs) {
                            rawArgs[arg.key] = part;
                            i++;
                        } else continue;
                    }
                }
            }
            if (subtag.args.length > i)
                throw new TooManyArgumentsError(this, subtag);
        }
        return rawArgs;
    }

    public async execute(subtag: BBSubTag, context: TContext): Promise<string> {
        let args;
        if (this.namedArgs.length > 0)
            args = await this.mapNamedArgs(subtag, context);

        let handler: SubTagHandler<TContext> | undefined;
        for (const rule of this.rules) {
            if (await rule.condition(subtag, args)) {
                handler = rule.handler.bind(this);
                break;
            }
        }

        if (handler === undefined)
            throw new MissingHandlerError(this, subtag);

        let result = await handler(subtag, context, args);
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

export class InvalidNamedArgumentError<TContext extends Context> extends Error {
    public subtag: SubTag<TContext>;
    public part: BBSubTag;

    constructor(subtag: SubTag<TContext>, part: BBSubTag) {
        super(`A named argument must be a key-value pair on ${subtag.name}`);
        this.subtag = subtag;
        this.part = part;
    }
}

export class NotEnoughArgumentsError<TContext extends Context> extends Error {
    public subtag: SubTag<TContext>;
    public part: BBSubTag;

    constructor(subtag: SubTag<TContext>, part: BBSubTag) {
        super(`Not enough arguments were provided on ${subtag.name}`);
        this.subtag = subtag;
        this.part = part;
    }
}
export class TooManyArgumentsError<TContext extends Context> extends Error {
    public subtag: SubTag<TContext>;
    public part: BBSubTag;

    constructor(subtag: SubTag<TContext>, part: BBSubTag) {
        super(`Too many arguments were provided on ${subtag.name}`);
        this.subtag = subtag;
        this.part = part;
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
export type SubTagHandler<TContext> = (subtag: BBSubTag, context: TContext, args?: RawArguments) => SubTagResult;
export type SubTagRule<TContext> = { condition: Condition, handler: SubTagHandler<TContext> };
export type SubTagError = (part: BBString | BBSubTag, context: Context) => Promise<string>;
export type SubTagResult = Promise<void | string | boolean | number | Array<string | number> | SubTagError>;
export interface SubTagOptions {
    alias?: string | string[],
    category?: string,
    globalName?: string | string[],
    allowNamed?: boolean
}
export interface NamedArgument {
    key: string,
    desc?: string,
    optional?: boolean,
    repeated?: boolean
}
export interface RawArguments {
    [name: string]: BBString | BBString[]
}