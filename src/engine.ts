import { Context } from './structures/context';
import { IDatabase } from './interfaces/idatabase';
import { BBString } from './language';

export class Engine {
    public readonly database: IDatabase;

    constructor(database: IDatabase) {
        this.database = database;
    }

    public async execute(bbstring: BBString, context: Context): Promise<string> {
        throw new Error('test');
    }
}