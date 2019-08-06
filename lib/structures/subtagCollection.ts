import { Constructor, Enumerable, IEnumerable, IsSupertypeOf } from '../util';
import { SubtagContext } from './context';
import { ISubtag } from './subtag';

export class SubtagCollection<T extends SubtagContext> extends Enumerable<ISubtag<T>> {
    private readonly _context: Constructor<T>;
    private readonly _parent: SubtagCollection<T> | undefined;
    private readonly _nameMap: Map<string, Array<ISubtag<T>>>;
    private readonly _aliasMap: Map<string, Array<ISubtag<T>>>;

    public constructor(context: Constructor<T>)
    public constructor(parent: SubtagCollection<T>)
    public constructor(...args: [Constructor<T>] | [SubtagCollection<T>]) {
        const [context, parent] = args[0] instanceof SubtagCollection ? [args[0]._context, args[0]] : [args[0], undefined];
        super(() => allSubtags.getEnumerator());

        this._context = context;
        this._parent = parent;
        this._nameMap = new Map();
        this._aliasMap = new Map();

        const allSubtags = (this._parent || Enumerable.empty()).concat(this.owned());
    }

    public createChild(): SubtagCollection<T> {
        return new SubtagCollection(this);
    }

    public owned(): IEnumerable<ISubtag<T>> {
        return Enumerable.from(this._nameMap).selectMany(([, v]) => v);
    }

    public find(name: string): ISubtag<T> | undefined;
    public find<S extends ISubtag<T>>(name: string, type: Constructor<S>): S | undefined;
    public find(name: string, type?: Constructor<ISubtag<T>>): ISubtag<T> | undefined {
        return _findStack(this as SubtagCollection<T>, c => c._parent, c => _find(c._nameMap, name, type) || _find(c._aliasMap, name, type));
    }

    public remove<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...subtags: Array<ISubtag<TSubtag>>): this;
    public remove(...subtags: Array<ISubtag<any>>): this {
        for (const subtag of subtags) {
            _remove(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _remove(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }

    public register<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...subtags: Array<ISubtag<TSubtag>>): this;
    public register(...subtags: Array<ISubtag<any>>): this {
        for (const subtag of subtags) {
            if (subtag.context !== this._context && !subtag.context.isPrototypeOf(this._context)) {
                throw new Error(`Subtag ${subtag.name} cannot be loaded into a collection which only accepts subtags of type ${this._context}`);
            }

            _register(this._nameMap, subtag.name, subtag);
            for (const alias of subtag.aliases) {
                _register(this._aliasMap, alias, subtag);
            }
        }

        return this;
    }
}

function _findStack<T, R>(current: T | undefined, next: (current: T) => T | undefined, action: (current: T) => R | undefined): R | undefined {
    while (current !== undefined) {
        const result = action(current);
        if (result !== undefined) { return result; }
        current = next(current);
    }
}

function _find<T>(map: Map<string, T[]>, key: string, type?: Constructor<T>): T | undefined {
    key = key.toLowerCase();
    const match = map.get(key);
    if (match !== undefined && match.length > 0) {
        if (type === undefined) {
            return match[match.length - 1];
        }
        for (let i = match.length; i > 0;) {
            if (match[--i] instanceof type) {
                return match[i];
            }
        }
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