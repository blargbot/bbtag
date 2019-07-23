import { Awaitable, BBTagEngine, ISubtag, ISubtagToken, SubtagContext, SubtagResult } from '../..';
import { DatabaseValue, IDatabase } from '../../lib/structures/database';
import { SystemContext } from '../../system';

export class MockEngine extends BBTagEngine<typeof MockExecutionContext> {
    public constructor() {
        super(MockExecutionContext, new MockDatabase());
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

export class MockExecutionContext extends SystemContext {
    public constructor() {
        super(new MockEngine(), { scope: 'TESTS', name: 'Tests' });
    }
}

export class MockSubtag<T extends SubtagContext> implements ISubtag<T> {
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