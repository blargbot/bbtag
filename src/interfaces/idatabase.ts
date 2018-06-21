import { Context } from '../structures/context';

export interface IDatabase<TContext extends Context> {
    getVariable(context: TContext, name: string): Promise<string>;
    setVariable(context: TContext, ...values: Array<{ name: string, value: string }>): Promise<void>
}