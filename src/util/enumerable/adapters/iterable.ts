import { Enumerable, Enumerator } from '..';

export class IterableEnumerable<T> extends Enumerable<T> {
    private readonly _source: Iterable<T>;

    public constructor(source: Iterable<T> | (() => Iterator<T>)) {
        super();

        this._source = typeof source === 'function' ? { [Symbol.iterator]: source } : source;
    }

    public getEnumerator(): IteratorEnumerator<T> {
        return new IteratorEnumerator(this._source[Symbol.iterator]());
    }
}

export class IteratorEnumerator<T> extends Enumerator<T> {
    private readonly _source: Iterator<T>;
    private _current: T;
    private _complete: boolean;

    public constructor(source: Iterator<T>) {
        super();

        this._source = source;
        this._current = undefined!;
        this._complete = false;
    }

    public moveNext(): boolean {
        if (this._complete) {
            return false;
        }

        const next = this._source.next();
        this._complete = next.done;
        this._current = next.value;

        return !next.done;
    }

    public get current(): T {
        return this._current;
    }
}