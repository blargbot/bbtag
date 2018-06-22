import { Context } from './structures/context';
import { IDatabase } from './interfaces/idatabase';
import { BBString } from './language';
import { SubTag } from './structures/subtag';

export class Engine {
    private readonly _subtags: Set<SubTag<any>> = new Set();

    public readonly database: IDatabase;
    public get subtags(): Array<SubTag<any>> { return [...this._subtags]; };

    constructor(database: IDatabase) {
        this.database = database;
    }

    public async execute(bbstring: BBString, context: Context): Promise<string> {
        throw new Error('test');
    }
}