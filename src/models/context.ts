import { Engine } from '../engine';
import { IDatabase } from '../interfaces';
import { ISubtag, SubtagResult } from './subtag';
import { IStringToken, ISubtagToken } from './bbtag';
import { SubtagCollection } from './subtagCollection';
import { VariableCollection } from './variableCollection';
import { SubtagError } from './errors';

export interface IExecutionContextArgs {
    readonly scope: string;
}

export abstract class SubtagContext {
    public readonly engine: Engine;
    public readonly overrides: SubtagCollection;
    public readonly tagName: string;
    public fallback: SubtagResult;
    public get database(): IDatabase { return this.engine.database; }

    public constructor(engine: Engine, tagName: string) {
        this.engine = engine;
        this.overrides = new SubtagCollection();
        this.tagName = tagName;
        this.fallback = undefined;
    }

    public findSubtag(this: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<TContext extends ExecutionContext>(this: TContext, name: string): ISubtag<TContext> | undefined;
    public findSubtag<TContext extends ExecutionContext>(this: TContext, name: string): ISubtag<TContext> | undefined {
        return this.overrides.findSubtag(this, name) || this.engine.subtags.findSubtag(this, name);
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
    public readonly variables: VariableCollection;

    public constructor(engine: Engine, tagName: string, args: IExecutionContextArgs) {
        super(engine, tagName);

        this.scope = args.scope;
        this.variables = new VariableCollection();
    }

    public execute(token: IStringToken): Promise<SubtagResult> {
        return this.engine.execute(token, this);
    }
}

export class OptimizationContext extends SubtagContext {
    public constructor(engine: Engine) {
        super(engine, 'system_optimize');
    }
}