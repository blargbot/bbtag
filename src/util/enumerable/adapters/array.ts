import { IterableEnumerable } from './iterable';

export class ArrayEnumerable<T> extends IterableEnumerable<T> {
    private readonly _raw: T[];

    public constructor(source: T[]) {
        super(source);
        this.toArray = () => source;
        this._raw = source;
    }
}