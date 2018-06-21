import { BBString, BBSubTag } from '../language';
import { Context } from './context';
import { Engine } from '../engine';
import { Condition } from './subtagConditions';
import * as conditions from './subtagConditions';

export abstract class SubTag<TContext extends Context> {
    public static readonly conditions = conditions;
    protected readonly rules: SubTagRule<TContext>[] = [];

    public readonly engine: Engine<TContext>;
    public readonly name: string;
    public readonly aliases: string[];

    constructor(engine: Engine<TContext>, name: string, options?: SubTagOptions) {
        options = options || {};
        this.engine = engine;
        this.name = name;

        this.aliases = options.aliases || [];
    }

    protected abstract defaultHandler: SubTagHandler<TContext>;

    protected whenArgs(condition: Condition, handler: SubTagHandler<TContext>): this {
        this.rules.push({ condition, handler });
        return this;
    }

    protected async parseArgs(subtag: BBSubTag, context: TContext, positions?: number | number[]): Promise<string[]> {
        if (positions === undefined)
            positions = [...new Array(subtag.args).keys()];
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
            handler = this.defaultHandler.bind(this) as SubTagHandler<TContext>;

        let result = await handler(subtag, context);
        switch (typeof result) {
            case 'function': return (<SubTagError<TContext>>result)(subtag, context);
            case 'string': return <string>result;
            case 'number': return String(result);
            case 'boolean': return String(result);
            case 'object': return JSON.stringify(result);
            default: return '';
        }
    }
}

export type SubTagHandler<TContext> = (subtag: BBSubTag, context: TContext) => SubTagResult<TContext>;
export type SubTagRule<TContext> = { condition: Condition, handler: SubTagHandler<TContext> };
export type SubTagError<TContext> = (part: BBString | BBSubTag, context: TContext) => string | Promise<string>;
export type SubTagResult<TContext> = Promise<void | string | boolean | number | Array<string | number> | SubTagError<TContext>>;
export interface SubTagOptions {
    aliases?: string[]
}
