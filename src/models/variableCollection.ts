import { ExecutionContext } from './context';
import { default as util, IVariableScope } from '../util';
import { DatabaseValue } from '../interfaces';

interface IVariableEntry {
    readonly original: DatabaseValue;
    current: DatabaseValue;
}

export class VariableCollection {
    private readonly context: ExecutionContext;
    private readonly cache: Map<string, IVariableEntry>;

    public constructor(context: ExecutionContext) {
        this.context = context;
        this.cache = new Map();
    }

    public async remove(key: string): Promise<void> {
        const { name, immediate, scope } = lookup(key);
        const cached = await this.lookup(key, name, immediate, scope);
        cached.current = undefined;
    }

    public async set(key: string, value: DatabaseValue): Promise<void> {
        const { name, immediate, scope } = lookup(key);
        if (immediate) {
            await scope.set(this.context, name, value);
            this.cache.set(key, { original: value, current: value });
        } else {
            const cached = await this.lookup(key, name, immediate, scope);
            cached.current = value;
        }
    }

    public async get(key: string): Promise<DatabaseValue> {
        const { name, immediate, scope } = lookup(key);
        const cached = await this.lookup(key, name, immediate, scope);
        return cached.current;
    }

    private async lookup(key: string, name: string, force: boolean, scope: IVariableScope): Promise<IVariableEntry> {
        let cached;
        if (force || (cached = this.cache.get(key)) === undefined) {
            const value = await scope.get(this.context, name);
            this.cache.set(key, cached = { original: value, current: value });
        }
        return cached;
    }
}

function lookup(key: string): { name: string, immediate: boolean, scope: IVariableScope } {
    let immediate = false;
    if (key.substring(0, 1) === '!') {
        immediate = true;
        key = key.substring(1);
    }

    for (const scope of util.variables) {
        if (key.startsWith(scope.prefix)) {
            return { name: key.substring(0, scope.prefix.length), scope, immediate };
        }
    }

    throw new Error(`Unknown scope for variable ${key}`);
}