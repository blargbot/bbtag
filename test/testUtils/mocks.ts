import { Awaitable, Constructor, DatabaseValue, IDatabase, ISubtag, ISubtagToken, SubtagContext, SubtagResult } from '../../lib';

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

type FunctionsOf<T extends { [key: string]: any }> = { [P in keyof T]?: T[P] extends (...args: any) => any ? T[P] : never };

export class MockSubtag<T extends SubtagContext = SubtagContext> implements ISubtag<T> {
    public readonly context: Constructor<T>;
    public name: string;
    public aliases: Set<string>;

    public constructor(context: Constructor<T>, name: string, handlers: FunctionsOf<ISubtag<T>> = {}) {
        this.context = context;
        this.name = name;
        this.aliases = new Set();

        for (const key of Object.keys(handlers)) {
            // @ts-ignore
            if (key in this && handlers[key] !== undefined) {
                // @ts-ignore
                this[key] = handlers[key];
            }
        }
    }

    public execute(): Awaitable<SubtagResult> {
        throw new Error('Method not implemented.');
    }
    public optimize(): string | ISubtagToken {
        throw new Error('Method not implemented.');
    }
}