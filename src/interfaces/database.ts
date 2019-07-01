import { SubtagPrimativeResult } from '../models/subtag';

export interface IDatabase {
    delete(path: Iterable<string> | string): Promise<void> | void;
    get(path: Iterable<string> | string): Promise<DatabaseValue> | DatabaseValue;
    set(path: Iterable<string> | string, values: DatabaseValue): Promise<void> | void;
}

export type DatabaseValue = SubtagPrimativeResult | SubtagPrimativeResult[];