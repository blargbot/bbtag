import { Enumerable } from '../util/enumerable';
import { ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagValue } from './subtagArguments';

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Promise<SubtagValue>;
    optimize(token: ISubtagToken, tracker: OptimizationContext): ISubtagToken | string;
}

export interface ISubtagArguments<TContext extends SubtagContext> {
    name: string;
    aliases?: Set<string> | string[] | Iterable<string> | Enumerable<string>;
    contextType: new (...args: any[]) => TContext;
}

export abstract class Subtag<T extends ExecutionContext> implements ISubtag<T> {
    public readonly contextType: new (...args: any[]) => T;
    public readonly name: string;
    public readonly aliases: Set<string>;

    constructor(args: ISubtagArguments<T>) {
        this.contextType = args.contextType;
        this.name = args.name;
        this.aliases = Enumerable.from(args.aliases as any || []).toSet();
    }

    public abstract execute(token: ISubtagToken, context: T): Promise<SubtagValue>;

    public optimize(token: ISubtagToken, context: OptimizationContext): ISubtagToken | string {
        return token;
    }

    public toString(): string {
        return `{${this.name}}`;
    }
}