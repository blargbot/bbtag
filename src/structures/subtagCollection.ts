import { Enumerable } from '../util';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { ISubtag } from './subtag';

type SubtagType<T>
    = T extends ExecutionContext ? ISubtag<T>
    : T extends OptimizationContext ? ISubtag<any>
    : never;

export class SubtagCollection<T extends SubtagContext> {
    public readonly [Symbol.iterator]: () => IterableIterator<SubtagType<T>>;
    private readonly _nameMap: Map<string, Array<SubtagType<T>>>;
    private readonly _aliasMap: Map<string, Array<SubtagType<T>>>;

    public constructor()
    public constructor(context: T, subtags: Iterable<ISubtag<any>>)
    public constructor(context?: T, subtags?: Iterable<ISubtag<any>>) {
        this._nameMap = new Map();
        this._aliasMap = new Map();
        this[Symbol.iterator] = this._nameMap.values as any as () => IterableIterator<SubtagType<T>>;

        if (context !== undefined) {
            this.register(...filterSubtags(context, subtags!));
        }
    }

    public find(name: string): SubtagType<T> | undefined {
        const byName = this._nameMap.get(name);
        if (byName !== undefined && byName.length > 0) {
            return byName[byName.length - 1];
        }
        const byAlias = this._aliasMap.get(name);
        if (byAlias !== undefined && byAlias.length > 0) {
            return byAlias[byAlias.length - 1];
        }
        return undefined;
    }

    public remove(...subtags: Array<SubtagType<T>>): this {
        for (const subtag of subtags) {
            _remove(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _remove(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }

    public register(...subtags: Array<SubtagType<T>>): this {
        for (const subtag of subtags) {
            _register(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _register(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }
}

function _register<T>(map: Map<string, Array<SubtagType<T>>>, key: string, subtag: SubtagType<T>): void {
    const current = map.get(key);
    if (current === undefined) {
        map.set(key, [subtag]);
    } else {
        current.push(subtag);
    }
}

function _remove<T>(map: Map<string, Array<SubtagType<T>>>, key: string, subtag: SubtagType<T>): void {
    const current = map.get(key);
    if (current !== undefined) {
        current.splice(current.indexOf(subtag), 1);
        if (current.length === 0) {
            map.delete(key);
        }
    }
}

function filterSubtags<T>(context: T, subtags: Iterable<ISubtag<any>>): Iterable<SubtagType<T>> {
    if (context instanceof OptimizationContext) {
        return subtags as Iterable<SubtagType<T>>;
    } else {
        return Enumerable.from(subtags).where(s => context instanceof s.context) as Iterable<ISubtag<any>> as Iterable<SubtagType<T>>;
    }
}