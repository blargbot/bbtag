import { ExecutionContext, SubtagError, SortedList, Awaitable } from '../models';
import { DatabaseValue } from '../interfaces';
import { Enumerable } from './enumerable';

export interface IVariableScope {
    name: string;
    prefix: string;
    description: string;
    set(context: ExecutionContext, key: string, values: DatabaseValue): Awaitable<void | undefined | SubtagError>;
    setBulk(context: ExecutionContext, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | undefined | SubtagError>;
    get(context: ExecutionContext, key: string): Awaitable<DatabaseValue>;
    delete(context: ExecutionContext, key: string): Awaitable<void>;
    getKey(context: ExecutionContext, key: string): Iterable<string>;
}

export interface IPartialVariableScope {
    name: IVariableScope['name'];
    prefix: IVariableScope['prefix'];
    description: IVariableScope['description'];
    set?: IVariableScope['set'];
    setBulk?: IVariableScope['setBulk'];
    get?: IVariableScope['get'];
    delete?: IVariableScope['delete'];
    getKey: IVariableScope['getKey'];
}

export const variableScopes: SortedList<IVariableScope> = new SortedList(scope => scope.prefix.length, false);

export class VariableScope implements IVariableScope {
    public readonly name: string;
    public readonly prefix: string;
    public readonly description: string;
    public readonly getKey: (context: ExecutionContext, key: string) => Iterable<string>;

    public constructor(overrides: IPartialVariableScope) {
        this.name = overrides.name;
        this.prefix = overrides.prefix;
        this.description = overrides.description;
        this.getKey = overrides.getKey;

        if (overrides.set !== undefined) { this.set = overrides.set; }
        if (overrides.setBulk !== undefined) { this.setBulk = overrides.setBulk; }
        if (overrides.get !== undefined) { this.get = overrides.get; }
        if (overrides.delete !== undefined) { this.delete = overrides.delete; }
    }

    public set(context: ExecutionContext, key: string, values: DatabaseValue): Awaitable<void | SubtagError | undefined> {
        return context.database.set(this.getKey(context, key), values);
    }

    public setBulk(context: ExecutionContext, entries: Iterable<readonly [string, DatabaseValue]>): Awaitable<void | SubtagError | undefined> {
        return context.database.setBulk(Enumerable.from(entries).select(([key, value]) => [this.getKey(context, key), value]));
    }

    public get(context: ExecutionContext, key: string): Awaitable<DatabaseValue> {
        return context.database.get(this.getKey(context, key));
    }

    public delete(context: ExecutionContext, key: string): Awaitable<void> {
        return context.database.delete(this.getKey(context, key));
    }
}

variableScopes.add(new VariableScope({ // Global '*'
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