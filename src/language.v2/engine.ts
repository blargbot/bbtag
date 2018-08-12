import { BBString, BBSubTag } from './structure';
import { IDatabase } from '../interfaces/idatabase';
import { Context } from './context';

export class Engine {
    public readonly database: IDatabase;

    constructor(database: IDatabase) {
        this.database = database;
    }

    public async execute(content: BBString, context: Context): Promise<string>;
    public async execute(content: BBString | BBSubTag, context: Context): Promise<any>;
    public async execute(content: BBString | BBSubTag, context: Context): Promise<any> {

    }
}