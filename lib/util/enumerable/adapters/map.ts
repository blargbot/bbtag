import { IterableEnumerable } from './iterable';

export class MapEnumerable<TKey, TValue> extends IterableEnumerable<[TKey, TValue]> {
    public constructor(source: Map<TKey, TValue>) {
        super(source);
    }
}