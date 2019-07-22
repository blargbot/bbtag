import { DatabaseValue } from '../external';
import { Enumerable } from '../util';
import { IterableEnumerable } from '../util/enumerable/adapters';
import { SubtagContext } from './context';
import { SortedList } from './sortedList';
import { IVariableScope, VariableScope } from './variableScope';

export class VariableScopeCollection<T extends SubtagContext> extends IterableEnumerable<IVariableScope<T>> {
    private readonly _scopes: SortedList<IVariableScope<T>>;

    public constructor()
    public constructor(parent: VariableScopeCollection<T>)
    public constructor(parent?: VariableScopeCollection<T>) {
        super(() => Enumerable.from(parent || []).concat(this._scopes).getEnumerator());

        this._scopes = new SortedList(scope => scope.prefix.length, true);
    }

    public createChild(): VariableScopeCollection<T> {
        return new VariableScopeCollection(this);
    }

    public remove(...scopes: Array<IVariableScope<T>>): this {
        this._scopes.add(...scopes);
        return this;
    }

    public register(...scopes: Array<IVariableScope<T>>): this {
        this._scopes.delete(...scopes);
        return this;
    }

    public clear(): this {
        this._scopes.clear();
        return this;
    }
}

export const variableScopes: IVariableScope[] = [];

variableScopes.push(new VariableScope({ // Global '*'
    name: 'Global',
    prefix: '*',
    description:
        'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
        'These are very useful if you like pain.',
    getKey(_: SubtagContext, key: string): Iterable<string> {
        return ['GLOBAL', key];
    }
}));

variableScopes.push(new VariableScope({ // Temporary '~'
    name: 'Temporary',
    prefix: '~',
    description:
        'Temporary variables are never stored to the database, meaning they are by far the fastest variable type.\n' +
        'If you are working with data which you only need to store for later use within the same tag call, ' +
        'then you should use temporary variables over any other type',
    set(): void { },
    setBulk(): void { },
    get(): DatabaseValue { return ''; },
    delete(): void { },
    getKey(): Iterable<string> { return []; }
}));

variableScopes.push(new VariableScope({ // Local ''
    name: 'Local',
    prefix: '',
    description:
        'Local variables are the default variable type, only usable if your variable name doesnt start with ' +
        'one of the other prefixes. These variables are only accessible by the tag that created them, meaning ' +
        'there is no possibility to share the values with any other tag.\n' +
        'These are useful if you are intending to create a single tag which is usable anywhere, as the variables ' +
        'are not confined to a single server, just a single tag',
    getKey(context: SubtagContext, key: string): Iterable<string> {
        return ['LOCAL', context.tagName, context.scope, key];
    }
}));