import { Awaitable, Enumerable } from '../util';
import { IStringToken, ISubtagToken } from './bbtag';
import { ExecutionContext } from './context';
import { SubtagResult } from './subtag';

export class ArgumentCollection<T extends ExecutionContext = ExecutionContext> {
    public readonly context: T;
    public readonly token: ISubtagToken;
    private readonly _executionCache: Map<number, SubtagResult>;

    constructor(context: T, token: ISubtagToken) {
        this.context = context;
        this.token = token;
        this._executionCache = new Map();
    }

    public getRaw(key: number): IStringToken | undefined;
    public getRaw(...keys: number[]): IterableIterator<IStringToken | undefined>;
    public getRaw(...keys: number[]): IterableIterator<IStringToken | undefined> | IStringToken | undefined {
        if (keys.length === 1) {
            return Enumerable.from(this._getRaw(keys)).first();
        }
        return this._getRaw(keys);
    }

    public get(key: number): SubtagResult;
    public get(...keys: number[]): IterableIterator<SubtagResult>;
    public get(...keys: number[]): IterableIterator<SubtagResult> | SubtagResult {
        if (keys.length === 1) {
            return Enumerable.from(this._get(keys)).first();
        }
        return this._get(keys);
    }

    public getAll(): IterableIterator<SubtagResult> {
        return this._get(Enumerable.range(0, this.token.args.length));
    }

    public execute(key: number): Awaitable<SubtagResult>;
    public execute(...keys: number[]): Awaitable<SubtagResult[]>;
    public execute(...keys: number[]): Awaitable<SubtagResult[] | SubtagResult> {
        if (keys.length === 1) {
            return this._execute(keys[0]);
        }
        return Promise.all(Enumerable.from(keys).select(key => this._execute(key)));
    }

    public executeAll(): Awaitable<SubtagResult[]> {
        return this.execute(...Enumerable.range(0, this.token.args.length));
    }

    public has(index: number): boolean {
        return this.token.args.length > index && index > 0;
    }

    private * _getRaw(indexes: Iterable<number>): IterableIterator<IStringToken | undefined> {
        for (const index of indexes) {
            yield this.token.args[index];
        }
    }

    private * _get(indexes: Iterable<number>): IterableIterator<SubtagResult> {
        for (const index of indexes) {
            if (!this._executionCache.has(index)) {
                throw new Error(`Key ${index} has not yet been executed or does not exist`);
            }
            yield this._executionCache.get(index);
        }
    }

    private async _execute(index: number): Promise<SubtagResult> {
        if (this._executionCache.has(index)) {
            return this._executionCache.get(index);
        }

        const token = this.token.args[index];
        const result = token === undefined ? undefined : await this.context.execute(token);
        this._executionCache.set(index, result);
        return result;
    }
}