import { Enumerable } from '../util';
import { SubtagContext } from './context';
import { ISubtag } from './subtag';

export class SubtagCollection<T extends SubtagContext> {
    private readonly _nameMap: Map<string, Array<ISubtag<T>>>;
    private readonly _aliasMap: Map<string, Array<ISubtag<T>>>;

    public constructor()
    public constructor(context: T, subtags: Iterable<ISubtag<any>>)
    public constructor(context?: T, subtags?: Iterable<ISubtag<any>>) {
        this._nameMap = new Map();
        this._aliasMap = new Map();

        if (context !== undefined) {
            this.register(...filterSubtags(context, subtags!));
        }
    }

    public [Symbol.iterator](): Iterator<ISubtag<T>> {
        return Enumerable.from(this._nameMap.values())
            .selectMany(x => x)[Symbol.iterator]();
    }

    public find(name: string): ISubtag<T> | undefined {
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

    public remove(...subtags: Array<ISubtag<T>>): this {
        for (const subtag of subtags) {
            _remove(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _remove(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }

    public register(...subtags: Array<ISubtag<T>>): this {
        for (const subtag of subtags) {
            _register(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _register(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }
}

function _register<T>(map: Map<string, T[]>, key: string, value: T): void {
    const current = map.get(key);
    if (current === undefined) {
        map.set(key, [value]);
    } else {
        current.push(value);
    }
}

function _remove<T>(map: Map<string, T[]>, key: string, value: T): void {
    const current = map.get(key);
    if (current !== undefined) {
        current.splice(current.indexOf(value), 1);
        if (current.length === 0) {
            map.delete(key);
        }
    }
}

function filterSubtags<T extends SubtagContext>(context: T, subtags: Iterable<ISubtag<any>>): Iterable<ISubtag<T>> {
    return Enumerable.from(subtags).where(s => context instanceof s.context);
}