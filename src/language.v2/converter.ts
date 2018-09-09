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
        if (typeof instance === 'string')
            return instance;
        console.log('Conversion for', instance, 'to string failed');
        throw new Error('Conversion Not Implemented.');
    }

    public toNumber(instance: any): number {
        if (typeof instance === 'number')
            return instance;
        console.log('Conversion for', instance, 'to number failed');
        throw new Error('Not Implemented');
    }

    public toArray(instance: any): any[] {
        if (Array.isArray(instance))
            return instance;
        console.log('Conversion for', instance, 'to array failed');
        throw new Error('Not Implemented');
    }
}