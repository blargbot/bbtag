import { Enumerable, IsSupertypeOf } from '../util';
import { SubtagContext } from './context';
import { SortedList } from './sortedList';
import { IVariableScope } from './variableScope';

export class VariableScopeCollection<T extends SubtagContext> extends Enumerable<IVariableScope<T>> {
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

    public remove<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...scopes: Array<IVariableScope<TSubtag>>): this;
    public remove(...scopes: Array<IVariableScope<any>>): this {
        this._scopes.add(...scopes);
        return this;
    }

    public register<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...scopes: Array<IVariableScope<TSubtag>>): this;
    public register(...scopes: Array<IVariableScope<any>>): this {
        this._scopes.delete(...scopes);
        return this;
    }

    public clear(): this {
        this._scopes.clear();
        return this;
    }
}