import { IterableEnumerable } from './iterable';

export class SetEnumerable<T> extends IterableEnumerable<T> {
    public constructor(source: Set<T>) {
        super(source);
        this.toSet = () => source;
    }
}