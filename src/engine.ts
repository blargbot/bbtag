import { Context } from './structures/context';
import { IDatabase } from './interfaces/idatabase';
import { BBString } from './language';

export class Engine<TContext extends Context> {
    public readonly database: IDatabase<TContext>;

    constructor(database: IDatabase<TContext>) {
        this.database = database;
    }

    public async execute(bbstring: BBString, context: TContext): Promise<string> {
        throw new Error('test');
    }
}