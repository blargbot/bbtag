import { SubtagPrimativeResult } from '../models/subtag';

export interface IDatabase {
    delete(path: Iterable<string> | string): Awaitable<void>;
    get(path: Iterable<string> | string): Awaitable<DatabaseValue>;
    set(path: Iterable<string> | string, values: DatabaseValue): Awaitable<void>;
}

export type DatabaseValue = SubtagPrimativeResult | SubtagPrimativeResult[];