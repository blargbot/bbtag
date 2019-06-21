import { ExecutionContext } from '../models';

type DatabasePrimative = string | number
export type DatabaseValue = Array<DatabasePrimative> | DatabasePrimative;

export interface IDatabase {
    get(context: ExecutionContext, key: string): DatabaseValue;
    set(context: ExecutionContext, key: string, value: DatabaseValue): void;
}