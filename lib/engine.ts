import { bbtag, IBBTag, IStringToken, ISubtagToken, SubtagResult } from './bbtag';
import { optimizeStringToken } from './optimizer';
import { ContextCtor, EventManager, OptimizationContext, SubtagCollection, SubtagContext, VariableScopeCollection } from './structures';
import { IDatabase } from './structures/database';
import { Awaitable, format } from './util';

interface IEngineEvents {
    'before-execute': (token: ISubtagToken, context: SubtagContext) => Awaitable<void>;
    'after-execute': (token: ISubtagToken, context: SubtagContext, result: SubtagResult) => Awaitable<void>;
    'subtag-error': (token: ISubtagToken, context: SubtagContext, error: any) => Awaitable<void>;
}

export class Engine<TContextType extends ContextCtor> {
    public readonly contextType: TContextType;
    public readonly subtags: SubtagCollection<InstanceType<TContextType>>;
    public readonly variableScopes: VariableScopeCollection<InstanceType<TContextType>>;
    public readonly database: IDatabase;
    protected readonly events: EventManager<IEngineEvents>;

    public constructor(context: TContextType, database: IDatabase) {
        this.contextType = context;
        this.subtags = new SubtagCollection();
        this.database = database;
        this.events = new EventManager();
        this.variableScopes = new VariableScopeCollection();
    }

    public execute(token: IStringToken, context: SubtagContext): Awaitable<SubtagResult>;
    public async execute(token: IStringToken, context: SubtagContext): Promise<SubtagResult> {
        const parts: SubtagResult[] = [];
        for (const subtag of token.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        if (parts.length === 1 && format(token.format, '') === '') {
            return parts[0];
        } else {
            return format(token.format, parts.map(bbtag.convert.toString));
        }
    }

    public process(source: string, context: InstanceType<TContextType>): IBBTag {
        const root = bbtag.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(context))
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

    protected async executeSubtag(token: ISubtagToken, context: SubtagContext): Promise<SubtagResult> {
        await Promise.all(this.events.raise('before-execute', token, context));
        const name = bbtag.convert.toString(await this.execute(token.name, context));
        const executor = context.subtags.find(name);

        let result: SubtagResult;

        if (executor === undefined) {
            result = context.error(token, `Unknown subtag ${name}`);
        } else {
            try {
                result = await executor.execute(token, context);
            } catch (ex) {
                await this.events.raise('subtag-error', token, context, ex);
                result = bbtag.check.error(ex) ? ex : context.error(token, 'Internal server error');
            }
        }

        await Promise.all(this.events.raise('after-execute', token, context, result));
        return result;
    }
}