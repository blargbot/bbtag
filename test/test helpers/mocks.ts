import { Engine } from '../../src';
import { DatabaseValue, IDatabase } from '../../src/external';
import { ExecutionContext } from '../../src/structures';
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