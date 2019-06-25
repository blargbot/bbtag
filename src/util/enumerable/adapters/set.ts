import { IterableEnumerable } from './iterable';

export class SetEnumerable<T> extends IterableEnumerable<T> {
    private readonly _raw: Set<T>;

    public constructor(source: Set<T>) {
        super(source);
        this.toSet = () => source;
        this._raw = source;
    }

    public toIterable(): Set<T> {
        return this._raw;
    }
}