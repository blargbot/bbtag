import { IStringToken, ISubtagToken, SubtagResult } from '../language';
import { Awaitable, Enumerable } from '../util';
import { ExecutionContext } from './context';

export class ArgumentCollection<T extends ExecutionContext = ExecutionContext> {
    public readonly context: T;
    public readonly token: ISubtagToken;
    private readonly _resultCache: Map<number, SubtagResult>;
    private readonly _promiseCache: Map<number, Promise<SubtagResult>>;

    public get length(): number { return this.token.args.length; }

    constructor(context: T, token: ISubtagToken) {
        this.context = context;
        this.token = token;
        this._resultCache = new Map();
        this._promiseCache = new Map();
    }

    public getRaw(key: number): IStringToken | undefined;
    public getRaw(...keys: number[]): Enumerable<IStringToken | undefined>;
    public getRaw(...keys: number[]): Enumerable<IStringToken | undefined> | IStringToken | undefined {
        if (keys.length === 1) {
            return this._getRaw(keys).first();
        }
        return this._getRaw(keys);
    }

    public get(key: number): SubtagResult;
    public get(...keys: number[]): Enumerable<SubtagResult>;
    public get(...keys: number[]): Enumerable<SubtagResult> | SubtagResult {
        if (keys.length === 1) {
            return this._get(keys).first();
        }
        return this._get(keys);
    }

    public getAll(): Enumerable<SubtagResult> {
        return this._get(Enumerable.range(0, this.token.args.length));
    }

    public execute(key: number): Awaitable<SubtagResult>;
    public execute(...keys: number[]): Awaitable<Enumerable<SubtagResult>>;
    public execute(...keys: number[]): Awaitable<Enumerable<SubtagResult> | SubtagResult> {
        if (keys.length === 1) {
            return this._execute(keys[0]);
        }
        return Promise.all(this._execute(keys)).then(v => Enumerable.from(v));
    }

    public executeAll(): Awaitable<Enumerable<SubtagResult>> {
        return this.execute(...Enumerable.range(0, this.token.args.length));
    }

    public has(...indexes: number[]): boolean {
        for (const index of indexes) {
            if (index < 0 || index >= this.token.args.length) {
                return false;
            }
        }
        return true;
    }

    public hasExecuted(...indexes: number[]): boolean {
        for (const index of indexes) {
            if (!this._resultCache.has(index)) {
                return false;
            }
        }
        return true;
    }

    private _getRaw(indexes: Iterable<number>): Enumerable<IStringToken | undefined> {
        return Enumerable.from(indexes).select(index => this.token.args[index]);
    }

    private _get(indexes: Iterable<number>): Enumerable<SubtagResult> {
        return Enumerable.from(indexes).select(index => {
            if (!this._resultCache.has(index)) {
                throw new Error(`Key ${index} has not yet been executed or does not exist`);
            }
            return this._resultCache.get(index);
        });
    }

    private _execute(index: number): Awaitable<SubtagResult>;
    private _execute(indexes: Iterable<number>): Array<Awaitable<SubtagResult>>;
    private _execute(indexes: Iterable<number> | number): Array<Awaitable<SubtagResult>> | Awaitable<SubtagResult> {
        const result = [];
        for (const index of typeof indexes === 'number' ? [indexes] : indexes) {
            if (this._resultCache.has(index)) {
                result.push(this._resultCache.get(index));
                continue;
            }
            if (!this._promiseCache.has(index)) {
                this._promiseCache.set(index, this._executeSingle(index));
            }
            result.push(this._promiseCache.get(index));
        }

        if (typeof indexes === 'number') {
            return result[0];
        }

        return result;
    }

    private async _executeSingle(index: number): Promise<SubtagResult> {
        const token = this.token.args[index];
        if (token === undefined) {
            return undefined;
        }
        const result = await this.context.execute(token);
        this._resultCache.set(index, result);
        this._promiseCache.delete(index);
        return result;
    }
}