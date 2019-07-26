import { Constructor, Enumerable, IsSupertypeOf } from '../util';
import { SubtagContext } from './context';
import { SortedList } from './sortedList';
import { IVariableScope } from './variableScope';

export class VariableScopeCollection<T extends SubtagContext> extends Enumerable<IVariableScope<T>> {
    private readonly _context: Constructor<T>;
    private readonly _scopes: SortedList<IVariableScope<T>>;

    public constructor(context: Constructor<T>)
    public constructor(parent: VariableScopeCollection<T>)
    public constructor(...args: [Constructor<T>] | [VariableScopeCollection<T>]) {
        const [context, parent] = args[0] instanceof VariableScopeCollection ? [args[0]._context, args[0]] : [args[0], undefined];
        super(() => Enumerable.from(parent || []).concat(this._scopes).getEnumerator());

        this._context = context;
        this._scopes = new SortedList(scope => scope.prefix.length, true);
    }

    public createChild(): VariableScopeCollection<T> {
        return new VariableScopeCollection(this);
    }

    public remove<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...scopes: Array<IVariableScope<TSubtag>>): this;
    public remove(...scopes: Array<IVariableScope<any>>): this {
        this._scopes.delete(...scopes);
        return this;
    }

    public register<TSubtag extends IsSupertypeOf<TSubtag, T, SubtagContext>>(...scopes: Array<IVariableScope<TSubtag>>): this;
    public register(...scopes: Array<IVariableScope<any>>): this {
        for (const scope of scopes) {
            if (scope.context !== this._context && !scope.context.isPrototypeOf(this._context)) {
                throw new Error(`Subtag ${scope.name} cannot be loaded into a collection which only accepts variable scopes of type ${this._context}`);
            }
            this._scopes.add(scope);
        }
        return this;
    }

    public clear(): this {
        this._scopes.clear();
        return this;
    }
}