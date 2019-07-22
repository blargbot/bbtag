import { ContextCtor, OptimizationContext, SubtagContext } from './contexts';
import { IDatabase } from './external';
import { bbtag, IBBTag, IStringToken, ISubtagToken, SubtagResult } from './language';
import { optimizeStringToken } from './optimizer';
import { EventManager, SubtagCollection, VariableScopeCollection } from './structures';
import { Awaitable, format } from './util';

interface IEngineEvents {
    'before-execute': (token: ISubtagToken, context: SubtagContext) => Awaitable<void>;
    'after-execute': (token: ISubtagToken, context: SubtagContext, result: SubtagResult) => Awaitable<void>;
    'subtag-error': (token: ISubtagToken, context: SubtagContext, error: any) => Awaitable<void>;
}

export class BBTagEngine<TContextType extends ContextCtor> {
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
            return format(token.format, parts.map(bbtag.toString));
        }
    }

    public process<T extends SubtagContext>(source: string, context: T): IBBTag {
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
                result = bbtag.isValue.error(ex) ? ex : context.error(token, 'Internal server error');
            }
        }

        await Promise.all(this.events.raise('after-execute', token, context, result));
        return result;
    }
}