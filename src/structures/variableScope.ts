import { DatabaseValue } from '../external';
import { ISubtagError } from '../language';
import { Awaitable, Enumerable } from '../util';
import { SubtagContext } from './context';

export interface IVariableScope<T extends SubtagContext = SubtagContext> {
    context: new (...args: any[]) => T;
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
    context: IVariableScope<T>['context'];
    name: IVariableScope<T>['name'];
    prefix: IVariableScope<T>['prefix'];
    description: IVariableScope<T>['description'];
    set?: IVariableScope<T>['set'];
    setBulk?: IVariableScope<T>['setBulk'];
    get?: IVariableScope<T>['get'];
    delete?: IVariableScope<T>['delete'];
    getKey: IVariableScope<T>['getKey'];
}

export const variableScopes: IVariableScope[] = [];

export class VariableScope<T extends SubtagContext = SubtagContext> implements IVariableScope<T> {
    public readonly context: new (...args: any[]) => T;
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
        this.context = options.context;
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
        return context.database.set(this.getKey(context, key), value);
    }

    /**
     * Sets multiple key value pairs in `context.database` according to the `entries` provided
     * @param context The context for this set operation
     * @param entries The key value pairs to set
     */
    public setBulk(context: T, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | ISubtagError | undefined> {
        return context.database.setBulk(Enumerable.from(entries).select(([key, value]) => [this.getKey(context, key), value]));
    }

    /**
     * Gets the value of the given `key` from `context.database`
     * @param context The context for this get operation
     * @param key The key to retrieve the value of
     */
    public get(context: T, key: string): Awaitable<DatabaseValue> {
        return context.database.get(this.getKey(context, key));
    }

    /**
     * Deletes a `key` from `context.database`
     * @param context The context for this delete operation
     * @param key The key to delete
     */
    public delete(context: T, key: string): Awaitable<void> {
        return context.database.delete(this.getKey(context, key));
    }
}

variableScopes.push(new VariableScope({ // Global '*'
    context: SubtagContext,
    name: 'Global',
    prefix: '*',
    description:
        'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
        'These are very useful if you like pain.',
    getKey(_: SubtagContext, key: string): Iterable<string> {
        return ['GLOBAL', key];
    }
}));

variableScopes.push(new VariableScope({ // Temporary '~'
    context: SubtagContext,
    name: 'Temporary',
    prefix: '~',
    description:
        'Temporary variables are never stored to the database, meaning they are by far the fastest variable type.\n' +
        'If you are working with data which you only need to store for later use within the same tag call, ' +
        'then you should use temporary variables over any other type',
    set(): void { },
    setBulk(): void { },
    get(): DatabaseValue { return ''; },
    delete(): void { },
    getKey(): Iterable<string> { return []; }
}));

variableScopes.push(new VariableScope({ // Local ''
    context: SubtagContext,
    name: 'Local',
    prefix: '',
    description:
        'Local variables are the default variable type, only usable if your variable name doesnt start with ' +
        'one of the other prefixes. These variables are only accessible by the tag that created them, meaning ' +
        'there is no possibility to share the values with any other tag.\n' +
        'These are useful if you are intending to create a single tag which is usable anywhere, as the variables ' +
        'are not confined to a single server, just a single tag',
    getKey(context: SubtagContext, key: string): Iterable<string> {
        return ['LOCAL', context.tagName, context.scope, key];
    }
}));

export default variableScopes;