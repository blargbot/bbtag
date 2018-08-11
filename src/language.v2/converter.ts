import { Variable } from './dataTypes';
import { IDatabase } from '../interfaces/idatabase';

export class Converter {
    protected readonly database: IDatabase;
    constructor(database: IDatabase) {
        this.database = database;
    }

    public async convert(value: any, toType: string) {
        switch (toType) {
            case 'string': return this.toString(value);
            case 'number': return this.toNumber(value);
        }
    }

    public toString(instance: any): string {
        throw new Error('Not Implemented');
    }

    public toNumber(instance: any): number {
        throw new Error('Not Implemented');
    }

    public toArray(instance: any): any[] {
        throw new Error('Not Implemented');
    }
}