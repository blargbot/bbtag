import { BBString, BBSubTag } from './structure';
import { IDatabase } from '../interfaces/idatabase';

export class Engine {
    public readonly database: IDatabase;

    constructor(database: IDatabase) {
        this.database = database;
    }

    public async execute(content: BBString, context: any): Promise<string>;
    public async execute(content: BBString | BBSubTag, context: any): Promise<any>;
    public async execute(content: BBString | BBSubTag, context: any): Promise<any> {

    }
}