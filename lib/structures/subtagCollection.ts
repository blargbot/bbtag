import { Enumerable, IsBetween, IterableEnumerable } from '../util';
import { SubtagContext } from './context';
import { ISubtag } from './subtag';

export class SubtagCollection<T extends SubtagContext> extends IterableEnumerable<ISubtag<T>> {
    private readonly _parent?: SubtagCollection<T>;
    private readonly _nameMap: Map<string, Array<ISubtag<T>>>;
    private readonly _aliasMap: Map<string, Array<ISubtag<T>>>;

    public constructor()
    public constructor(parent: SubtagCollection<T>)
    public constructor(...args: [] | [SubtagCollection<T>]) {
        super(() => this[Symbol.iterator]());

        this._nameMap = new Map();
        this._aliasMap = new Map();
        this._parent = undefined;

        if (args[0] instanceof SubtagCollection) {
            this._parent = args[0];
        }
    }

    public [Symbol.iterator](): Iterator<ISubtag<T>> {
        return Enumerable.from(this._parent || [])
            .concat(Enumerable.from(this._nameMap.values()).selectMany(x => x))
            .getEnumerator();
    }

    public createChild(): SubtagCollection<T> {
        return new SubtagCollection(this);
    }

    public * list(): IterableIterator<ISubtag<T>> {
        for (const subtags of this._nameMap.values()) {
            yield* subtags;
        }
    }

    public find(name: string): ISubtag<T> | undefined {
        return (this._parent && this._parent.find(name)) ||
            _find(this._nameMap, name) || _find(this._aliasMap, name);
    }

    public remove<TSubtag extends IsBetween<TSubtag, T, SubtagContext>>(...subtags: Array<ISubtag<TSubtag>>): this;
    public remove(...subtags: Array<ISubtag<any>>): this {
        for (const subtag of subtags) {
            _remove(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _remove(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }

    public register<TSubtag extends IsBetween<TSubtag, T, SubtagContext>>(...subtags: Array<ISubtag<TSubtag>>): this;
    public register(...subtags: Array<ISubtag<any>>): this {
        for (const subtag of subtags) {
            _register(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _register(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }
}

function _find<T>(map: Map<string, T[]>, key: string): T | undefined {
    key = key.toLowerCase();
    const match = map.get(key);
    if (match !== undefined && match.length > 0) {
        return match[match.length - 1];
    }
}

function _register<T>(map: Map<string, T[]>, key: string, value: T): void {
    key = key.toLowerCase();
    const current = map.get(key);
    if (current === undefined) {
        map.set(key, [value]);
    } else {
        current.push(value);
    }
}

function _remove<T>(map: Map<string, T[]>, key: string, value: T): void {
    key = key.toLowerCase();
    const current = map.get(key);
    if (current !== undefined) {
        current.splice(current.indexOf(value), 1);
        if (current.length === 0) {
            map.delete(key);
        }
    }
}