import { IterableEnumerable } from './iterable';

export class MapEnumerable<TKey, TValue> extends IterableEnumerable<[TKey, TValue]> {
    private readonly _raw: Map<TKey, TValue>;

    public constructor(source: Map<TKey, TValue>) {
        super(source);
        this._raw = source;
    }
}