import { ExecutionContext, SubtagError, SortedList } from '../models';
import { DatabaseValue } from '../interfaces';

export interface IVariableScope {
    name: string;
    prefix: string;
    description: string;
    set(context: ExecutionContext, key: string, values: DatabaseValue): Promise<void | undefined | SubtagError> | void | undefined | SubtagError;
    get(context: ExecutionContext, key: string): Promise<DatabaseValue> | DatabaseValue;
    delete(context: ExecutionContext, key: string): Promise<void> | void;
    getKey(context: ExecutionContext, key: string): string[];
}

export const variableScopes: SortedList<IVariableScope> = new SortedList(scope => scope.prefix.length, false);

variableScopes.add({ // Global '*'
    name: 'Global',
    prefix: '*',
    description:
        'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
        'These are very useful if you like pain.',
    async set(context: ExecutionContext, key: string, values: DatabaseValue): Promise<void> {
        await context.database.set(this.getKey(context, key), values);
    },
    async get(context: ExecutionContext, key: string): Promise<DatabaseValue> {
        return context.database.get(this.getKey(context, key));
    },
    async delete(context: ExecutionContext, key: string): Promise<void> {
        return context.database.delete(this.getKey(context, key));
    },
    getKey(_: ExecutionContext, key: string): string[] {
        return ['GLOBAL', key];
    }
});

variableScopes.add({ // Temporary '~'
    name: 'Temporary',
    prefix: '~',
    description:
        'Temporary variables are never stored to the database, meaning they are by far the fastest variable type.\n' +
        'If you are working with data which you only need to store for later use within the same tag call, ' +
        'then you should use temporary variables over any other type',
    set(): void { },
    get(): DatabaseValue { return ''; },
    delete(): void { },
    getKey(): string[] { return []; }
});

variableScopes.add({ // Local ''
    name: 'Local',
    prefix: '',
    description:
        'Local variables are the default variable type, only usable if your variable name doesnt start with ' +
        'one of the other prefixes. These variables are only accessible by the tag that created them, meaning ' +
        'there is no possibility to share the values with any other tag.\n' +
        'These are useful if you are intending to create a single tag which is usable anywhere, as the variables ' +
        'are not confined to a single server, just a single tag',
    async set(context: ExecutionContext, key: string, values: DatabaseValue): Promise<void> {
        await context.database.set(this.getKey(context, key), values);
    },
    async get(context: ExecutionContext, key: string): Promise<DatabaseValue> {
        return context.database.get(this.getKey(context, key));
    },
    async delete(context: ExecutionContext, key: string): Promise<void> {
        return context.database.delete(this.getKey(context, key));
    },
    getKey(context: ExecutionContext, key: string): string[] {
        return ['LOCAL', context.tagName, context.scope, key];
    }
});

export default variableScopes;