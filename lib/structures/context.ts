import { BBTagEngine } from '../engine';
import { IStringToken, ISubtagError, ISubtagToken, SubtagResult } from '../language';
import { Awaitable } from '../util';
import { SubtagCollection } from './subtagCollection';
import { VariableCache } from './variableCache';

export type ContextCtor<T = SubtagContext> = new (engine: BBTagEngine<any>, ...args: any[]) => T;

export interface ISubtagContextArgs {
    readonly name: string;
    readonly scope: string;
}

export class SubtagContext {
    public readonly type: typeof SubtagContext;
    public readonly engine: BBTagEngine<this['type']>;
    public readonly variables: VariableCache<this>;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public readonly scope: string;
    public readonly errors: ISubtagError[];
    public fallback: SubtagResult;

    public constructor(engine: BBTagEngine<typeof SubtagContext>, args: ISubtagContextArgs) {
        this.type = this.constructor as any;
        this.engine = engine as BBTagEngine<ContextCtor<this>>;
        this.variables = new VariableCache(this);
        this.subtags = engine.subtags.createChild() as any;
        this.tagName = args.name;
        this.fallback = undefined;
        this.scope = args.scope;
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

export class OptimizationContext {
    public readonly inner: SubtagContext;
    public readonly warnings: any[];

    public constructor(inner: SubtagContext) {
        this.inner = inner;
        this.warnings = [];
    }
}