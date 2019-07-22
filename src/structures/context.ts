import { Engine } from '../engine';
import { IDatabase } from '../external';
import { IStringToken, ISubtagError, ISubtagToken, SubtagResult } from '../language';
import { Awaitable } from '../util';
import { SortedList } from './sortedList';
import { SubtagCollection } from './subtagCollection';
import { VariableCollection } from './variableCollection';

export interface IExecutionContextArgs<T extends SubtagContext> {
    readonly scope: string;
    readonly variableScopes?: Iterable<IVariableScope<T>>;
}

export interface IContextState {
    return: boolean;
}

export class SubtagContext {
    public readonly engine: Engine;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public readonly state: Partial<IContextState>;
    public readonly scope: string;
    public readonly variables: VariableCollection<this>;
    public readonly errors: ISubtagError[];
    public fallback: SubtagResult;

    public get database(): IDatabase { return this.engine.database; }

    public constructor(engine: Engine, tagName: string, args: IExecutionContextArgs<SubtagContext>) {
        this.engine = engine;
        this.subtags = new SubtagCollection(this, engine.subtags);
        this.tagName = tagName;
        this.fallback = undefined;
        this.state = {};
        this.scope = args.scope;
        this.variables = new VariableCollection<this>(this, filterVariableScopes(this, args.variableScopes || variableScopes));
        this.errors = [];
    }

    public execute(token: IStringToken): Awaitable<SubtagResult> {
        return this.engine.execute(token, this);
    }

    public error(token: ISubtagToken | IStringToken, message: string): ISubtagError;
    public error(token: ISubtagToken | IStringToken, innerError: Error): ISubtagError;
    public error(token: ISubtagToken | IStringToken, message: string | Error): ISubtagError {
        const error: ISubtagError = {
            message: typeof message === 'object' ? message.message : message,
            context: this,
            token
        };
        this.errors.push(error);
        return error;
    }
}

function filterVariableScopes<T extends SubtagContext>(context: T, scopes: Iterable<IVariableScope<SubtagContext>>): SortedList<IVariableScope<T>> {
    const result = new SortedList<IVariableScope<T>>(scope => scope.prefix.length, false);

    for (const scope of scopes) {
        if (context instanceof scope.context) {
            result.add(scope as IVariableScope<T>);
        }
    }

    return result;
}

export class OptimizationContext {
    public readonly inner: SubtagContext;
    public readonly warnings: any[];

    public constructor(inner: SubtagContext) {
        this.inner = inner;
        this.warnings = [];
    }
}

// This needs to be at the end due to a circular reference
import { default as variableScopes, IVariableScope } from './variableScope';