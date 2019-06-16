import { IterableEnumerable } from './iterable';

export class ArrayEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: T[]) {
        super(source);
        this.toIterable = () => source;
    }
}

export interface ArrayEnumerable<T> extends IterableEnumerable<T> {
    toIterable(): T[];
}