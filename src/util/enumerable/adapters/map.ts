import { IterableEnumerable } from './iterable';

export class MapEnumerable<Key, Value> extends IterableEnumerable<[Key, Value]> {
    public constructor(source: Map<Key, Value>) {
        super(source);
        this.toIterable = () => source;
    }
}

export interface MapEnumerable<Key, Value> extends IterableEnumerable<[Key, Value]> {
    toIterable(): Map<Key, Value>;
}