import { BBTagEngine } from '../../engine';
import { IStringToken, ISubtagError, ISubtagToken, SubtagResult } from '../../language';
import { SubtagCollection } from '../../structures/subtagCollection';
import { VariableCache } from '../../structures/variableCache';
import { Awaitable } from '../../util';

export type ContextCtor<T = SystemContext> = new (engine: BBTagEngine<any>, ...args: any[]) => T;

export interface ISubtagContextArgs {
    readonly name: string;
    readonly scope: string;
}

export class SystemContext {
    public readonly type: typeof SystemContext;
    public readonly engine: BBTagEngine<this['type']>;
    public readonly variables: VariableCache<this>;
    public readonly subtags: SubtagCollection<this>;
    public readonly tagName: string;
    public readonly state: Partial<IContextState>;
    public readonly scope: string;
    public readonly errors: ISubtagError[];
    public fallback: SubtagResult;

    public readonly discrim1!: number; // TODO Remove this as it is temporary to force clashes between the context types

    public constructor(engine: BBTagEngine<typeof SystemContext>, args: ISubtagContextArgs) {
        this.type = this.constructor as any;
        this.engine = engine as BBTagEngine<ContextCtor<this>>;
        this.variables = new VariableCache(this);
        this.subtags = engine.subtags.createChild() as any;
        this.tagName = args.name;
        this.fallback = undefined;
        this.state = {};
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

export interface IContextState {
    return: boolean;
}