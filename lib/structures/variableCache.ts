import { Awaitable, Enumerable } from '../util';
import { SubtagContext } from './context';
import { DatabaseValue } from './database';
import { IVariableScope } from './variableScope';

interface ICacheEntry {
    readonly original: DatabaseValue;
    current: DatabaseValue;
}

export class VariableCache<TContext extends SubtagContext> {
    private readonly context: TContext;
    private readonly cache: Map<string, ICacheEntry>;

    public constructor(context: TContext) {
        this.context = context;
        this.cache = new Map();
    }

    public delete(key: string): Awaitable<void>;
    public async delete(key: string): Promise<void> {
        return this.set(key, undefined);
    }

    public set(key: string, value: DatabaseValue): Awaitable<void>;
    public async set(key: string, value: DatabaseValue): Promise<void> {
        const { name, immediate, scope } = this.parseKey(key);
        const cached = await this.findOrCache(name, scope);
        cached.current = value;
        if (immediate) {
            await this.commit([scope.prefix + name]);
        }
    }

    public get(key: string): Awaitable<DatabaseValue>;
    public async get(key: string): Promise<DatabaseValue> {
        const { name, immediate, scope } = this.parseKey(key);
        if (immediate) {
            this.cache.delete(scope.prefix + name);
        }
        const cached = await this.findOrCache(name, scope);
        return cached.current;
    }

    public commit(keys?: Iterable<string>): Awaitable<void>;
    public async commit(keys?: Iterable<string>): Promise<void> {
        if (keys === undefined) { keys = this.cache.keys(); }

        await Promise.all(Enumerable.from(keys)
            .select(key => ({ ...this.parseKey(key), entry: this.cache.get(key) }))
            .where(e => e.entry !== undefined)
            .groupBy(g => g.scope)
            .select(g => g.key.setBulk(this.context, g.select(e => [e.name, e.entry!.current]))));

        for (const key of keys) {
            const entry = this.cache.get(key);
            if (entry !== undefined) {
                this.cache.set(key, { current: entry.current, original: entry.current });
            }
        }
    }

    public rollback(keys?: Iterable<string>): void {
        if (keys === undefined) { keys = this.cache.keys(); }
        for (const key of keys) {
            const entry = this.cache.get(key);
            if (entry !== undefined) {
                entry.current = entry.original;
            }
        }
    }

    private async findOrCache(name: string, scope: IVariableScope<TContext>): Promise<ICacheEntry> {
        let cached = this.cache.get(scope.prefix + name);
        if (cached === undefined) {
            const value = await scope.get(this.context, name);
            this.cache.set(scope.prefix + name, cached = { original: value, current: value });
        }
        return cached;
    }

    private parseKey(key: string): { name: string, immediate: boolean, scope: IVariableScope<TContext> } {
        let immediate = false;
        if (key.substring(0, 1) === '!') {
            immediate = true;
            key = key.substring(1);
        }

        for (const scope of this.context.engine.variableScopes) {
            if (key.startsWith(scope.prefix)) {
                return {
                    name: key.substring(scope.prefix.length),
                    scope: scope as IVariableScope<TContext>,
                    immediate
                };
            }
        }

        throw new Error(`Unknown scope for variable ${key}`);
    }
}