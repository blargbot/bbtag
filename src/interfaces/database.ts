import { Awaitable, SubtagPrimativeResult } from '../models';

export interface IDatabase {
    delete(path: Iterable<string>): Awaitable<void>;
    get(path: Iterable<string>): Awaitable<DatabaseValue>;
    set(path: Iterable<string>, values: DatabaseValue): Awaitable<void>;
    setBulk(entries: Iterable<readonly [Iterable<string>, DatabaseValue]>): Awaitable<void>;
}

export type DatabaseValue = SubtagPrimativeResult | SubtagPrimativeResult[];