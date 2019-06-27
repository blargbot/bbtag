import { Enumerable, Enumerator } from '..';
import { IterableEnumerable } from './iterable';

export class StringEnumerable extends IterableEnumerable<string> {
    private readonly _raw: string;

    public constructor(source: string) {
        super(source);
        this._raw = source;
    }
}