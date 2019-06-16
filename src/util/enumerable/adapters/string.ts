import { Enumerable, Enumerator } from '..';
import { IterableEnumerable } from './iterable';

export class StringEnumerable extends IterableEnumerable<string> {
    public constructor(source: string) {
        super(source);
        this.toIterable = () => source;
    }
}

export interface StringEnumerable extends IterableEnumerable<string> {
    toIterable(): string;
}