import { Engine } from '../engine';
import { IDatabase } from '../external';
import { SubtagResult } from './subtag';
import { IStringToken, ISubtagToken } from './bbtag';
import { SubtagCollection } from './subtagCollection';
import { VariableCollection } from './variableCollection';
import { SubtagError } from './errors';
import { Awaitable } from '../util';
import { SortedList } from './sortedList';

export interface IExecutionContextArgs<T extends ExecutionContext> {
    readonly scope: string;
    readonly variableScopes?: Iterable<IVariableScope<T>>;
}

export abstract class SubtagContext {
    public readonly engine: Engine;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public fallback: SubtagResult;
    public get database(): IDatabase { return this.engine.database; }

    public constructor(engine: Engine, tagName: string) {
        this.engine = engine;
        this.subtags = new SubtagCollection(this, engine.subtags);
        this.tagName = tagName;
        this.fallback = undefined;
    }

    public error(token: ISubtagToken | IStringToken): SubtagError;
    public error(message: string, token: ISubtagToken | IStringToken): SubtagError;
    public error(innerError: Error, token: ISubtagToken | IStringToken): SubtagError;
    public error(message: string, innerError: Error, token: ISubtagToken | IStringToken): SubtagError;
    public error(message: any, innerError?: any, token?: any): SubtagError {
        return new SubtagError(this, message, innerError, token);
    }
}

export class ExecutionContext extends SubtagContext {
    public readonly scope: string;
    public readonly variables: VariableCollection<this>;

    public constructor(engine: Engine, tagName: string, args: IExecutionContextArgs<ExecutionContext>) {
        super(engine, tagName);

        this.scope = args.scope;
        this.variables = new VariableCollection<this>(this, filterVariableScopes(this, args.variableScopes || variableScopes));
    }

    public execute(token: IStringToken): Awaitable<SubtagResult> {
        return this.engine.execute(token, this);
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
import { default as variableScopes, IVariableScope } from './variableScopes';
