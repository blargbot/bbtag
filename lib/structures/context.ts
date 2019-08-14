import { IStringToken, ISubtagError, ISubtagToken, SubtagPrimitiveResult, SubtagResult } from '../bbUtil';
import { Engine } from '../engine';
import { Awaitable } from '../util';
import { SubtagCollection } from './subtagCollection';
import { VariableCache } from './variableCache';

export interface ISubtagContextArgs {
    readonly name: string;
    readonly scope: string;
    readonly arguments: readonly SubtagPrimitiveResult[];
}

export class SubtagContext {
    public readonly engine: Engine<this>;
    public readonly variables: VariableCache<this>;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public readonly scope: string;
    public readonly errors: ISubtagError[];
    public readonly stackTrace: ReadonlyArray<ISubtagToken | IStringToken>;
    public readonly config: ISubtagContextArgs;
    public readonly arguments: readonly SubtagPrimitiveResult[];
    public fallback: SubtagResult;

    public get isTerminated(): boolean { return this._terminated; }

    private _terminated: boolean;

    public constructor(engine: Engine<SubtagContext>, args: ISubtagContextArgs) {
        this.config = args;
        this.engine = engine as Engine<this>;
        this.variables = new VariableCache(this);
        this.subtags = engine.subtags.createChild() as SubtagCollection<this>;
        this.tagName = args.name;
        this.fallback = undefined;
        this.scope = args.scope;
        this.errors = [];
        this.stackTrace = [];
        this._terminated = false;
        this.arguments = args.arguments;
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

    public terminate(): void {
        this._terminated = true;
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