import { Context } from './structures/context';
import { IDatabase } from './interfaces/idatabase';
import { BBString } from './language';
import { SubTag } from './structures/subtag';
import { SubTagMap } from './structures/subtag.map';

export class Engine {
    public readonly subtags: SubTagMap = new SubTagMap();

    public readonly database: IDatabase;

    constructor(database: IDatabase) {
        this.database = database;
    }

    public async execute(bbstring: BBString, context: Context): Promise<string> {
        let result = [];
        for (const part of bbstring.parts) {
            if (typeof part === 'string')
                result.push(part);
            else {
                let name = await this.execute(part.name, context);

                // TODO logic here
            }
        }
        return result.join('');
    }
}