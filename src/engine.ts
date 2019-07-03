import { IDatabase } from './external';
import {
    ExecutionContext,
    IBBTag,
    IStringToken,
    ISubtagToken,
    OptimizationContext,
    SubtagCollection,
    SubtagResult,
    EventManager,
    ISubtag
} from './structures';
import { optimizeStringToken } from './optimizer';
import { Parser } from './parser';
import { default as util, Awaitable } from './util';
import { IVariableScope } from './structures/variableScopes';

interface IEngineEvents {
    'before-execute': (token: ISubtagToken, context: ExecutionContext) => Awaitable;
    'after-execute': (token: ISubtagToken, context: ExecutionContext, result: SubtagResult) => Awaitable;
}

export class Engine {
    public parser: Parser;
    public readonly subtags: Array<ISubtag<any>>;
    public readonly database: IDatabase;
    protected readonly events: EventManager<IEngineEvents>;

    public constructor(database: IDatabase) {
        this.parser = new Parser();
        this.subtags = [];
        this.database = database;
        this.events = new EventManager();
    }

    public execute(input: IStringToken, context: ExecutionContext): Awaitable<SubtagResult>;
    public async execute(input: IStringToken, context: ExecutionContext): Promise<SubtagResult> {
        const parts: SubtagResult[] = [];
        for (const subtag of input.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        if (parts.length === 1 && util.format(input.format, '') === '') {
            return parts[0];
        } else {
            return util.format(input.format, parts.map(util.subtag.toString));
        }
    }

    public process(source: string): IBBTag {
        const root = this.parser.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }

    public on<TKey extends keyof IEngineEvents>(event: TKey, handler: IEngineEvents[TKey]): this {
        this.events.on(event, handler);
        return this;
    }

    public off<TKey extends keyof IEngineEvents>(event: TKey, handler: IEngineEvents[TKey]): this {
        this.events.off(event, handler);
        return this;
    }

    protected async executeSubtag(input: ISubtagToken, context: ExecutionContext): Promise<SubtagResult> {
        await Promise.all(this.events.raise('before-execute', input, context));
        const name = util.subtag.toString(await this.execute(input.name, context));
        const executor = context.subtags.find(name);

        let result: SubtagResult;

        if (executor === undefined) {
            result = context.error(`Unknown subtag ${name}`, input);
        } else {
            try {
                result = await executor.execute(input, context);
            } catch (ex) {
                result = context.error('Internal server error', ex, input);
            }
        }

        await Promise.all(this.events.raise('after-execute', input, context, result));
        return result;
    }
}