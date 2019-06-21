import { IterableEnumerable } from './iterable';

export class SetEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Set<T>) {
        super(source);
        this.toIterable = () => source;
        this.toSet = () => source;
    }
}

export interface SetEnumerable<T> extends IterableEnumerable<T> {
    toIterable(): Set<T>;
}