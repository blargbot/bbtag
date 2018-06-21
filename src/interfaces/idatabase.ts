import { Context } from '../structures/context';

export interface IDatabase<TContext extends Context> {
    variables: {
        get(context: TContext, name: string): Promise<string>;
        set(context: TContext, values: { name: string, value: string }[]): Promise<void>;
    }
}