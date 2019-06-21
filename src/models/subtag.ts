import { SubtagContext, ExecutionContext, OptimizationContext } from './context';
import { SubtagToken } from './bbtag';
import { Enumerable } from '../util/enumerable';

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: SubtagToken, context: TContext): Promise<string | void> | string | void;
    optimize(token: SubtagToken, tracker: OptimizationContext): SubtagToken | string;
}

export interface SubtagArguments<TContext extends SubtagContext> {
    name: string;
    aliases?: Set<string> | string[] | Iterable<string> | Enumerable<string>;
    contextType: new (...args: any[]) => TContext;
}

export abstract class Subtag<TContext extends ExecutionContext> implements ISubtag<TContext> {
    public readonly contextType: new (...args: any[]) => TContext;
    public readonly name: string;
    public readonly aliases: Set<string>;

    constructor(args: SubtagArguments<TContext>) {
        this.contextType = args.contextType;
        this.name = args.name;
        this.aliases = Enumerable.from(<any>args.aliases || []).toSet();
    }

    public abstract execute(token: SubtagToken, context: TContext): Promise<string | void> | string | void;

    public optimize(token: SubtagToken, context: OptimizationContext): SubtagToken | string {
        return token;
    }
}

export type SubtagHandler = () => Promise<string> | string;