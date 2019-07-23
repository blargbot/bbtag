import { IterableEnumerable } from './iterable';

export class ArrayEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: T[]) {
        super(source);
        this.toArray = () => source;
    }
}