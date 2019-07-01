import { ExecutionContext, SubtagResult } from '../models';

export interface IDatabase {
    delete(path: Iterable<string> | string): Promise<void> | void;
    get(path: Iterable<string> | string): Promise<SubtagResult> | SubtagResult;
    set(path: Iterable<string> | string, values: Iterable<SubtagResult>): Promise<void> | void;
}