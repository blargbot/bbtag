import { Engine } from '../../src';
import { DatabaseValue, IDatabase } from '../../src/external';
import { ISubtagToken, SubtagResult } from '../../src/language';
import { ExecutionContext, ISubtag } from '../../src/structures';
import { Awaitable } from '../../src/util';

export class MockEngine extends Engine {
    public constructor() {
        super(new MockDatabase());
    }
}

export class MockDatabase implements IDatabase {
    public delete: (path: Iterable<string>) => Awaitable<void>;
    public get: (path: Iterable<string>) => Awaitable<DatabaseValue>;
    public set: (path: Iterable<string>, values: DatabaseValue) => Awaitable<void>;
    public setBulk: (entries: Iterable<readonly [Iterable<string>, DatabaseValue]>) => Awaitable<void>;

    public constructor() {
        this.delete = () => { };
        this.get = () => { };
        this.set = () => { };
        this.setBulk = () => { };
    }
}

export class MockExecutionContext extends ExecutionContext {
    public constructor() {
        super(new MockEngine(), 'Tests', { scope: 'TESTS' });
    }
}

export class MockSubtag<T extends ExecutionContext> implements ISubtag<T> {
    public context: new (...args: any[]) => T;
    public name: string;
    public aliases: Set<string>;

    public constructor(context: new (...args: any[]) => T, name: string) {
        this.context = context;
        this.name = name;
        this.aliases = new Set();
    }

    public execute(): Awaitable<SubtagResult> {
        throw new Error('Method not implemented.');
    }
    public optimize(): string | ISubtagToken {
        throw new Error('Method not implemented.');
    }

}