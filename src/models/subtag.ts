import { Enumerable } from '../util/enumerable';
import { ISubtagToken } from './bbtag';
import { ExecutionContext, OptimizationContext, SubtagContext } from './context';
import { SubtagArgumentCollection, SubtagArgumentDefinition, SubtagHandler } from './subtagArguments';
import { createSubtagResult, SubtagExecutionResult } from './subtagResults';

export interface ISubtag<TContext extends ExecutionContext> {
    readonly contextType: new (...args: any[]) => TContext;
    readonly name: string;
    readonly aliases: ReadonlySet<string>;

    execute(token: ISubtagToken, context: TContext): Promise<SubtagExecutionResult>;
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
    protected readonly handlers: SubtagArgumentCollection<T>;

    constructor(args: ISubtagArguments<T>) {
        this.contextType = args.contextType;
        this.name = args.name;
        this.aliases = Enumerable.from(args.aliases as any || []).toSet();
        this.handlers = new SubtagArgumentCollection();
    }

    public async execute(token: ISubtagToken, context: T): Promise<SubtagExecutionResult> {
        try {
            const result = await this.handlers.execute(token, context);
            return createSubtagResult(result);
        } catch (ex) {
            return createSubtagResult(ex);
        }
    }

    public optimize(token: ISubtagToken, context: OptimizationContext): ISubtagToken | string {
        return token;
    }

    public toString(): string {
        return `{${this.name}}`;
    }
}