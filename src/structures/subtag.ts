import { BBString, BBSubTag, BBSource } from '../language';
import { Context } from './context';
import { Engine } from '../engine';
import { Condition } from './subtag.conditions';
import * as conditions from './subtag.conditions';
import * as errors from './subtag.errors';
import { IDatabase } from '../interfaces/idatabase';
import { array } from '../util';

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

    private maxArgs: number = 0;
    private minArgs: number = 0;
    private remainingArgMap: { important: number, required: number }[] = [];

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
        let important = 0;
        let required = 0;

        // Check there are no duplicated key names
        let keyMap: string[] = [];
        let duplicatedKeys = namedArgs.filter(arg => {
            if (keyMap.indexOf(arg.key.toLowerCase()) === -1) {
                keyMap.push(arg.key.toLowerCase());
                return false;
            }
            return true;
        });
        if (duplicatedKeys.length > 0) {
            throw new DuplicatedArgumentKeys(this, duplicatedKeys);
        }

        // Reset the argument variables
        this.namedArgs = namedArgs;
        this.maxArgs = this.minArgs = 0;
        this.remainingArgMap = [];

        // Loop through the named args backwards. 
        // For each element increase the max & min args where needed
        // and increase the important/required counts where needed.
        // important & required are a count of the number of such args
        // after the current element, hence the reverse loop
        for (let i = namedArgs.length - 1; i >= 0; i--) {
            this.remainingArgMap.splice(0, 0, { important, required });
            let arg = namedArgs[i];
            if (arg.optional) {
                this.maxArgs++;
                if (arg.priority) {
                    important++;
                }
            } else {
                this.minArgs++;
                this.maxArgs++;
                important++;
                required++;
            }
        }
    }

    protected whenArgs(condition: Condition, handler: SubTagHandler<TContext>): this {
        this.rules.push({ condition: condition.bind(this), handler: handler.bind(this) });
        return this;
    }

    protected default(handler: SubTagHandler<TContext>): this {
        this.rules.push({ condition: () => true, handler: handler.bind(this) });
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

    protected async parseNamedArg(subtag: BBSubTag, context: TContext, rawArgs: RawArguments, name: string, ) {
        let result = await this.parseNamedArgs(subtag, context, rawArgs, name);
        return result.args[name];
    }

    protected async parseNamedArgs(subtag: BBSubTag, context: TContext, rawArgs: RawArguments, names?: string | string[]) {
        let args: { [name: string]: string | string[] } = {};

        if (names === undefined) {
            names = this.namedArgs.map(a => a.key);
        } else if (!Array.isArray(names)) {
            names = [names];
        }

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
        let rawArgs: RawArguments = {};
        if (subtag.named) { // map named args
            for (const part of subtag.args[0].parts) {
                if (typeof part !== 'string') {
                    if (part.keyValue && part.name) {
                        let key = await this.engine.execute(part.name, context);
                        key = key.substring(1); // remove * prefix
                        let arg = this.namedArgs.find(na => na.key === key);
                        if (arg) {
                            if (arg.repeated) {
                                let entry = rawArgs[key];
                                let argArray = Array.isArray(entry) ? entry : entry = rawArgs[key] = [];
                                argArray.push(part.args[0]);
                            } else {
                                rawArgs[key] = part.args[0];
                            }
                        } else {
                            return this.errors.args.unknownNamed(key);
                        }
                    } else {
                        return this.errors.args.nonNamed();
                    }
                }
            }
        } else { // map positional args
            let current = 0;
            let conditionals: { key: string, requires: string, value: BBString }[] = [];
            function handleConditions() {
                let met = array.all(conditionals, c =>
                    array.any(conditionals, e => c.requires === e.key)
                );
                if (met) {
                    for (const condition of conditionals) {
                        rawArgs[condition.key] = condition.value;
                    }
                } else {
                    current -= conditionals.length;
                }
                conditionals = [];
            }
            for (let i = 0; i < this.namedArgs.length; i++) {
                let arg = this.namedArgs[i];
                let remaining = this.remainingArgMap[i];
                if (!arg.conditional && conditionals.length > 0) {
                    handleConditions();
                }
                let remainingParts = subtag.args.length - current;
                let part = subtag.args[current];

                if (arg.repeated) {
                    let repeatCount = current + Math.max(arg.optional ? 0 : 1, remainingParts - remaining.required);
                    let values = subtag.args.slice(current, repeatCount);
                    if (values.length > 0) {
                        rawArgs[arg.key] = values;
                        current += values.length;
                    }
                } else {
                    if (!arg.optional) {
                        if (!part) {
                            return this.errors.args.notEnough(this.minArgs);
                        }
                        rawArgs[arg.key] = part;
                        current++;
                    } else {
                        if (remainingParts > remaining.required) {
                            if (arg.conditional) {
                                conditionals.push({ key: arg.key, requires: arg.conditional, value: part });
                                current++;
                            } else if (arg.priority || remainingParts > remaining.important) {
                                rawArgs[arg.key] = part;
                                current++;
                            }
                        } else {
                            continue;
                        }
                    }
                }
            }
            if (conditionals.length > 0) {
                handleConditions();
            }
            if (subtag.args.length > current) {
                return this.errors.args.tooMany(this.maxArgs);
            }
        }
        return rawArgs;
    }

    public async execute(subtag: BBSubTag, context: TContext): Promise<string> {
        let args: RawArguments | SubTagError = {};
        if (this.namedArgs.length > 0)
            args = await this.mapNamedArgs(subtag, context);

        let handler: SubTagHandler<TContext> | undefined;

        let result: any;

        if (typeof args === 'function') {
            result = await args(subtag, context);
        } else {
            for (const rule of this.rules) {
                if (await rule.condition(subtag, args)) {
                    handler = rule.handler.bind(this);
                    break;
                }
            }

            if (handler === undefined)
                throw new MissingHandlerError(this, subtag);

            result = await handler(subtag, context, args);
        }
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

export class DuplicatedArgumentKeys<TContext extends Context> extends Error {
    public keys: NamedArgument[];
    public subtag: SubTag<TContext>;

    constructor(subtag: SubTag<TContext>, keys: NamedArgument[]) {
        super(`Duplicated argument keys ${keys.map(arg => arg.key)} on ${subtag.name}`);
        this.subtag = subtag;
        this.keys = keys;
    }
}

export class MissingHandlerError<TContext extends Context> extends Error {
    public subtag: SubTag<TContext>;
    public part: BBSubTag;

    constructor(subtag: SubTag<TContext>, part: BBSubTag) {
        super(`Missing handler on ${subtag.name}`);
        this.subtag = subtag;
        this.part = part;
    }
}

export type BaseSubtagOptions<TContext> = SubTagOptions & { context: new (...args: any[]) => TContext };
export type SubTagHandler<TContext> = (subtag: BBSubTag, context: TContext, args: RawArguments) => SubTagResult;
export type SubTagRule<TContext> = { condition: Condition, handler: SubTagHandler<TContext> };
export type SubTagError = (part: BBString | BBSubTag, context: Context) => Promise<string>;
export type SubTagResult = Promise<void | string | boolean | number | Array<string | number> | SubTagError>;
export interface SubTagOptions {
    alias?: string | string[];
    category?: string;
    globalName?: string | string[];
    allowNamed?: boolean;
}
export interface NamedArgument {
    key: string;
    desc?: string;
    optional?: boolean;
    repeated?: boolean;
    conditional?: string;
    priority?: boolean;
}
export interface RawArguments {
    [name: string]: BBString | BBString[];
}