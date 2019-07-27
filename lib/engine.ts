import { bbtag, IBBTag, IStringToken, ISubtagToken, SubtagResult } from './bbtag';
import { optimizeStringToken } from './optimizer';
import { EventManager, OptimizationContext, SubtagCollection, SubtagContext, VariableScopeCollection } from './structures';
import { IDatabase } from './structures/database';
import { Awaitable, Constructor, format } from './util';

interface IEngineEvents {
    'before-execute': (token: ISubtagToken, context: SubtagContext) => Awaitable<void>;
    'after-execute': (token: ISubtagToken, context: SubtagContext, result: SubtagResult) => Awaitable<void>;
    'subtag-error': (token: ISubtagToken, context: SubtagContext, error: any) => Awaitable<void>;
}

type Super<T extends SubtagContext> = T & { stackTrace: Array<T['stackTrace'][number]> };

export class Engine<T extends SubtagContext> {
    public readonly subtags: SubtagCollection<T>;
    public readonly variableScopes: VariableScopeCollection<T>;
    public readonly database: IDatabase;
    public readonly events: EventManager<IEngineEvents>;

    public constructor(context: Constructor<T>, database: IDatabase) {
        this.events = new EventManager();
        this.subtags = new SubtagCollection(context);
        this.variableScopes = new VariableScopeCollection(context);
        this.database = database;
    }

    public execute(token: IStringToken, context: T): Awaitable<SubtagResult>;
    public async execute(token: IStringToken, context: Super<T>): Promise<SubtagResult> {
        context.stackTrace.push(token);
        const parts = await Promise.all(token.subtags.map(t => this.executeSubtag(t, context)));
        context.stackTrace.pop();

        return token.format === '{0}' ? parts[0] : format(token.format, parts.map(bbtag.convert.toString));
    }

    public process(source: string, context: T): IBBTag {
        const root = bbtag.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(context))
        };
    }

    protected async executeSubtag(token: ISubtagToken, context: Super<T>): Promise<SubtagResult> {
        if (context.isTerminated) { return ''; }

        await Promise.all(this.events.raise('before-execute', token, context));
        context.stackTrace.push(token);
        const name = bbtag.convert.toString(await this.execute(token.name, context));
        const executor = context.subtags.find(name);

        let result: SubtagResult;

        if (executor === undefined) {
            result = bbtag.errors.system.unknownSubtag(context, token, name);
        } else {
            try {
                result = await executor.execute(token, context);
            } catch (ex) {
                await this.events.raise('subtag-error', token, context, ex);
                result = bbtag.check.error(ex) ? ex : bbtag.errors.system.internal(context, token);
            }
        }

        context.stackTrace.pop();
        await Promise.all(this.events.raise('after-execute', token, context, result));
        return result;
    }
}