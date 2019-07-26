import { ISubtagError } from '../bbtag';
import { Awaitable, Enumerable } from '../util';
import { SubtagContext } from './context';
import { DatabaseValue } from './database';

export interface IVariableScope<T extends SubtagContext = SubtagContext> {
    name: string;
    prefix: string;
    description: string;

    /**
     * Sets the `key` in `context.database` to `value`
     * @param context The context for this set operation
     * @param key The key to set
     * @param value The value to set the key to
     */
    set(context: T, key: string, value: DatabaseValue): Awaitable<void | undefined | ISubtagError>;

    /**
     * Sets multiple key value pairs in `context.database` according to the `entries` provided
     * @param context The context for this set operation
     * @param entries The key value pairs to set
     */
    setBulk(context: T, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | undefined | ISubtagError>;

    /**
     * Gets the value of the given `key` from `context.database`
     * @param context The context for this get operation
     * @param key The key to retrieve the value of
     */
    get(context: T, key: string): Awaitable<DatabaseValue>;

    /**
     * Deletes a `key` from `context.database`
     * @param context The context for this delete operation
     * @param key The key to delete
     */
    delete(context: T, key: string): Awaitable<void>;

    /**
     * Generates a location path from the `key` and `context` to identify which record should be modified or retrieved
     * @param context The context used to generate the database key path
     * @param key The key to retrieve
     */
    getKey(context: T, key: string): Iterable<string>;
}

export interface IPartialVariableScope<T extends SubtagContext = SubtagContext> {
    name: IVariableScope<T>['name'];
    prefix: IVariableScope<T>['prefix'];
    description: IVariableScope<T>['description'];
    set?: IVariableScope<T>['set'];
    setBulk?: IVariableScope<T>['setBulk'];
    get?: IVariableScope<T>['get'];
    delete?: IVariableScope<T>['delete'];
    getKey: IVariableScope<T>['getKey'];
}

export class VariableScope<T extends SubtagContext = SubtagContext> implements IVariableScope<T> {
    public readonly name: string;
    public readonly prefix: string;
    public readonly description: string;

    /**
     * Generates a location path from the `key` and `context` to identify which record should be modified or retrieved
     * @param context The context used to generate the database key path
     * @param key The key to retrieve
     */
    public readonly getKey: (context: T, key: string) => Iterable<string>;

    public constructor(options: IPartialVariableScope<T>) {
        this.name = options.name;
        this.prefix = options.prefix;
        this.description = options.description;
        this.getKey = options.getKey;

        if (options.set !== undefined) { this.set = options.set; }
        if (options.setBulk !== undefined) { this.setBulk = options.setBulk; }
        if (options.get !== undefined) { this.get = options.get; }
        if (options.delete !== undefined) { this.delete = options.delete; }
    }

    /**
     * Sets the `key` in `context.database` to `value`
     * @param context The context for this set operation
     * @param key The key to set
     * @param value The value to set the key to
     */
    public set(context: T, key: string, value: DatabaseValue): Awaitable<void | ISubtagError | undefined> {
        return context.engine.database.set(this.getKey(context, key), value);
    }

    /**
     * Sets multiple key value pairs in `context.database` according to the `entries` provided
     * @param context The context for this set operation
     * @param entries The key value pairs to set
     */
    public setBulk(context: T, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | ISubtagError | undefined> {
        return context.engine.database.setBulk(Enumerable.from(entries).select(([key, value]) => [this.getKey(context, key), value]));
    }

    /**
     * Gets the value of the given `key` from `context.database`
     * @param context The context for this get operation
     * @param key The key to retrieve the value of
     */
    public get(context: T, key: string): Awaitable<DatabaseValue> {
        return context.engine.database.get(this.getKey(context, key));
    }

    /**
     * Deletes a `key` from `context.database`
     * @param context The context for this delete operation
     * @param key The key to delete
     */
    public delete(context: T, key: string): Awaitable<void> {
        return context.engine.database.delete(this.getKey(context, key));
    }
}