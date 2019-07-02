import { ExecutionContext, SubtagError, SortedList } from '../models';
import { DatabaseValue } from '../interfaces';
import { Enumerable } from './enumerable';
import { Awaitable } from './types';

export interface IVariableScope<T extends ExecutionContext> {
    context: new (...args: any[]) => T;
    name: string;
    prefix: string;
    description: string;
    set(context: T, key: string, values: DatabaseValue): Awaitable<void | undefined | SubtagError>;
    setBulk(context: T, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | undefined | SubtagError>;
    get(context: T, key: string): Awaitable<DatabaseValue>;
    delete(context: T, key: string): Awaitable<void>;
    getKey(context: T, key: string): Iterable<string>;
}

export interface IPartialVariableScope<T extends ExecutionContext> {
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

export const variableScopes: SortedList<IVariableScope<ExecutionContext>> = new SortedList(scope => scope.prefix.length, false);

export class VariableScope<T extends ExecutionContext> implements IVariableScope<T> {
    public readonly context: new (...args: any[]) => T;
    public readonly name: string;
    public readonly prefix: string;
    public readonly description: string;
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

    public set(context: T, key: string, values: DatabaseValue): Awaitable<void | SubtagError | undefined> {
        return context.database.set(this.getKey(context, key), values);
    }

    public setBulk(context: T, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | SubtagError | undefined> {
        return context.database.setBulk(Enumerable.from(entries).select(([key, value]) => [this.getKey(context, key), value]));
    }

    public get(context: T, key: string): Awaitable<DatabaseValue> {
        return context.database.get(this.getKey(context, key));
    }

    public delete(context: T, key: string): Awaitable<void> {
        return context.database.delete(this.getKey(context, key));
    }
}

variableScopes.add(new VariableScope({ // Global '*'
    context: ExecutionContext,
    name: 'Global',
    prefix: '*',
    description:
        'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
        'These are very useful if you like pain.',
    getKey(_: ExecutionContext, key: string): Iterable<string> {
        return ['GLOBAL', key];
    }
}));

variableScopes.add(new VariableScope({ // Temporary '~'
    context: ExecutionContext,
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

variableScopes.add(new VariableScope({ // Local ''
    context: ExecutionContext,
    name: 'Local',
    prefix: '',
    description:
        'Local variables are the default variable type, only usable if your variable name doesnt start with ' +
        'one of the other prefixes. These variables are only accessible by the tag that created them, meaning ' +
        'there is no possibility to share the values with any other tag.\n' +
        'These are useful if you are intending to create a single tag which is usable anywhere, as the variables ' +
        'are not confined to a single server, just a single tag',
    getKey(context: ExecutionContext, key: string): Iterable<string> {
        return ['LOCAL', context.tagName, context.scope, key];
    }
}));

export default variableScopes;