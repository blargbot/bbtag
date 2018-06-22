import { BBString, BBSubTag } from '../language';
import { Context } from './context';
import { Engine } from '../engine';
import { Condition } from './subtag.conditions';
import * as conditions from './subtag.conditions';
import * as errors from './subtag.errors';
import { IDatabase } from '../interfaces/idatabase';

export abstract class SubTag {
    public static readonly conditions = conditions;
    public static readonly errors = errors;

    protected readonly rules: SubTagRule[] = [];

    public readonly engine: Engine;
    public readonly database: IDatabase;
    public readonly name: string;
    public readonly aliases: string[];

    protected constructor(engine: Engine, name: string, options?: SubTagOptions) {
        options = options || {};
        this.engine = engine;
        this.database = this.engine.database;
        this.name = name;

        this.aliases = options.aliases || [];
    }

    protected whenArgs(condition: Condition, handler: SubTagHandler): this {
        this.rules.push({ condition: condition.bind(this), handler: handler.bind(this) });
        return this;
    }

    protected async parseArgs(subtag: BBSubTag, context: Context, positions?: number | number[]): Promise<string[]> {
        if (positions === undefined)
            positions = [...new Array(subtag.args).keys()];
        else if (!Array.isArray(positions))
            positions = [positions];

        let promises = positions.map(position => this.engine.execute(subtag.args[position], context));
        return await Promise.all(promises);
    }

    public async execute(subtag: BBSubTag, context: Context): Promise<string> {
        let handler: SubTagHandler | undefined;
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
            case 'function': return await (<SubTagErrorFunc>result)(subtag, context);
            case 'string': return <string>result;
            case 'number': return String(result);
            case 'boolean': return String(result);
            case 'object': return JSON.stringify(result);
            default: return '';
        }
    }
}

export class MissingHandlerError extends Error {
    public subtag: SubTag;
    public part: BBSubTag;

    constructor(subtag: SubTag, part: BBSubTag) {
        super(`Missing handler on ${subtag.name} for ${JSON.stringify(part.args)}`);
        this.subtag = subtag;
        this.part = part;
    }
}

export type SubTagHandler = (subtag: BBSubTag, context: Context) => SubTagResult;
export type SubTagRule = { condition: Condition, handler: SubTagHandler };
export type SubTagErrorFunc = (part: BBString | BBSubTag, context: Context) => Promise<string>;
export type SubTagResult = Promise<void | string | boolean | number | Array<string | number> | SubTagErrorFunc>;
export interface SubTagOptions {
    aliases?: string[]
}
