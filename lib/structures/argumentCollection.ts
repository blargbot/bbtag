import { IStringToken, ISubtagToken, SubtagResult } from '../bbtag';
import { ArrayLikeEnumerable, Awaitable, Enumerable, IEnumerable } from '../util';
import { AsyncCache } from './asyncCache';
import { SubtagContext } from './context';

function unknownIndex(index: number): never {
    throw new Error(`No argument ${index} has been supplied`);
}

export class ArgumentCollection<T extends SubtagContext = SubtagContext> extends ArrayLikeEnumerable<IStringToken> {
    public readonly context: T;
    public readonly token: ISubtagToken;
    private readonly _cache: AsyncCache<number, SubtagResult>;

    constructor(context: T, token: ISubtagToken) {
        super(token.args);
        this.context = context;
        this.token = token;
        this._cache = new AsyncCache<number, SubtagResult>(async index => {
            if (!this.hasIndex(index)) { unknownIndex(index); }
            return this.context.execute(this.token.args[index]);
        });
    }

    public getRaw(key: number): IStringToken;
    public getRaw(key1: number, key2: number, ...keys: number[]): IEnumerable<IStringToken | undefined>;
    public getRaw(...keys: [number] | [number, number, ...number[]]): IEnumerable<IStringToken | undefined> | IStringToken {
        const result = Enumerable.from(keys).forEach(i => this.hasIndex(i)).select(i => this.token.args[i]);
        return keys.length === 1 ? result.first() : result.cache();
    }

    public get(key: number): SubtagResult;
    public get(key1: number, key2: number, ...keys: number[]): IEnumerable<SubtagResult>;
    public get(...keys: [number] | [number, number, ...number[]]): IEnumerable<SubtagResult> | SubtagResult {
        const result = Enumerable.from(keys).select(i => this._cache.get(i));
        return keys.length === 1 ? result.first() : result.cache();
    }

    public getAll(): IEnumerable<SubtagResult> {
        return this.select((_, i) => this._cache.get(i));
    }

    public execute(key: number): Awaitable<SubtagResult>;
    public execute(key1: number, key2: number, ...keys: number[]): Awaitable<IEnumerable<SubtagResult>>;
    public execute(...keys: number[]): Awaitable<IEnumerable<SubtagResult> | SubtagResult> {
        const result = Enumerable.from(keys).select(i => this._cache.getAsync(i));
        return keys.length === 1 ? result.first() : Promise.all(result).then(Enumerable.from);
    }

    public executeAll(): Awaitable<IEnumerable<SubtagResult>> {
        return Promise.all(this.select((_, i) => this._cache.getAsync(i))).then(Enumerable.from);
    }

    public hasIndex(key: number, ...indexes: number[]): boolean;
    public hasIndex(...indexes: number[]): boolean {
        return Enumerable.from(indexes).all(i => 0 <= i && i < this.token.args.length);
    }

    public hasExecuted(key: number, ...indexes: number[]): boolean;
    public hasExecuted(...indexes: number[]): boolean {
        return Enumerable.from(indexes).all(i => this._cache.has(i));
    }
}