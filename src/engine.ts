import { IDatabase } from './external';
import { bbtag, IBBTag, IStringToken, ISubtagToken, SubtagResult } from './language';
import { optimizeStringToken } from './optimizer';
import { EventManager, ExecutionContext, ISubtag, OptimizationContext } from './structures';
import { Awaitable, format } from './util';

interface IEngineEvents {
    'before-execute': (token: ISubtagToken, context: ExecutionContext) => Awaitable<void>;
    'after-execute': (token: ISubtagToken, context: ExecutionContext, result: SubtagResult) => Awaitable<void>;
    'subtag-error': (token: ISubtagToken, context: ExecutionContext, error: any) => Awaitable<void>;
}

export class Engine {
    public readonly subtags: Array<ISubtag<any>>;
    public readonly database: IDatabase;
    protected readonly events: EventManager<IEngineEvents>;

    public constructor(database: IDatabase) {
        this.subtags = [];
        this.database = database;
        this.events = new EventManager();
    }

    public execute(token: IStringToken, context: ExecutionContext): Awaitable<SubtagResult>;
    public async execute(token: IStringToken, context: ExecutionContext): Promise<SubtagResult> {
        const parts: SubtagResult[] = [];
        for (const subtag of token.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        if (parts.length === 1 && format(token.format, '') === '') {
            return parts[0];
        } else {
            return format(token.format, parts.map(bbtag.toString));
        }
    }

    public process(source: string): IBBTag {
        const root = bbtag.parse(source);
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

    protected async executeSubtag(token: ISubtagToken, context: ExecutionContext): Promise<SubtagResult> {
        await Promise.all(this.events.raise('before-execute', token, context));
        const name = bbtag.toString(await this.execute(token.name, context));
        const executor = context.subtags.find(name);

        let result: SubtagResult;

        if (executor === undefined) {
            result = context.error(token, `Unknown subtag ${name}`);
        } else {
            try {
                result = await executor.execute(token, context);
            } catch (ex) {
                await this.events.raise('subtag-error', token, context, ex);
                result = bbtag.value.isError(ex) ? ex : context.error(token, 'Internal server error');
            }
        }

        await Promise.all(this.events.raise('after-execute', token, context, result));
        return result;
    }
}