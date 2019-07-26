export class AsyncCache<K, T> {
    private readonly _resultCache: Map<K, () => T>;
    private readonly _promiseCache: Map<K, Promise<T>>;
    private readonly _populate: (key: K) => Promise<T>;
    public constructor(populate: (key: K) => Promise<T>) {
        this._resultCache = new Map();
        this._promiseCache = new Map();
        this._populate = populate;
    }

    public async getAsync(key: K): Promise<T> {
        if (this._resultCache.has(key)) {
            return this._resultCache.get(key)!();
        }
        if (this._promiseCache.has(key)) {
            return this._promiseCache.get(key)!;
        }
        return this.populate(key);
    }

    public get(key: K): T {
        if (this._resultCache.has(key)) {
            return this._resultCache.get(key)!();
        }
        throw new Error(`Key ${key} has not yet been requested`);
    }

    public has(key: K): boolean {
        return this._resultCache.has(key);
    }

    private populate(key: K): Promise<T> {
        const promise = this._populate(key);
        this._promiseCache.set(key, promise);
        promise.then(v => this._resultCache.set(key, () => v));
        promise.catch(err => this._resultCache.set(key, () => { throw err; }));
        promise.finally(() => this._promiseCache.delete(key));
        return promise;
    }
}
