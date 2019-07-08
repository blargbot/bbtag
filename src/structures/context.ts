import { Engine } from '../engine';
import { IDatabase } from '../external';
import { IStringToken, ISubtagToken, SubtagResult } from '../language';
import { Awaitable } from '../util';
import { SubtagError } from './errors';
import { SortedList } from './sortedList';
import { SubtagCollection } from './subtagCollection';
import { VariableCollection } from './variableCollection';

export interface IExecutionContextArgs<T extends ExecutionContext> {
    readonly scope: string;
    readonly variableScopes?: Iterable<IVariableScope<T>>;
}

export interface IContextState {
    return: boolean;
}

export abstract class SubtagContext {
    public readonly engine: Engine;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public readonly state: Partial<IContextState>;
    public fallback: SubtagResult;

    public get database(): IDatabase { return this.engine.database; }

    public constructor(engine: Engine, tagName: string) {
        this.engine = engine;
        this.subtags = new SubtagCollection(this, engine.subtags);
        this.tagName = tagName;
        this.fallback = undefined;
        this.state = {};
    }
}

export class ExecutionContext extends SubtagContext {
    public readonly scope: string;
    public readonly variables: VariableCollection<this>;
    public readonly errors: SubtagError[];

    public constructor(engine: Engine, tagName: string, args: IExecutionContextArgs<ExecutionContext>) {
        super(engine, tagName);

        this.scope = args.scope;
        this.variables = new VariableCollection<this>(this, filterVariableScopes(this, args.variableScopes || variableScopes));
        this.errors = [];
    }

    public execute(token: IStringToken): Awaitable<SubtagResult> {
        return this.engine.execute(token, this);
    }

    public error(token: ISubtagToken | IStringToken, message?: string, innerError?: any): SubtagError {
        const error = new SubtagError(this, token, message, innerError);
        this.errors.push(error);
        return error;
    }
}

function filterVariableScopes<T extends ExecutionContext>(context: T, scopes: Iterable<IVariableScope<ExecutionContext>>): SortedList<IVariableScope<T>> {
    const result = new SortedList<IVariableScope<T>>(scope => scope.prefix.length, false);

    for (const scope of scopes) {
        if (context instanceof scope.context) {
            result.add(scope as IVariableScope<T>);
        }
    }

    return result;
}

export class OptimizationContext extends SubtagContext {
    public readonly warnings: any[];

    public constructor(engine: Engine) {
        super(engine, 'system_optimize');

        this.warnings = [];
    }
}

// This needs to be at the end due to a circular reference
import { default as variableScopes, IVariableScope } from './variableScope';