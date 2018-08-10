import { Context } from '../structures/context';

export interface IDatabase {
    getVariable(context: Context, name: string): Promise<string>;
    setVariable(context: Context, ...values: Array<{ name: string, value: string }>): Promise<void>;
}