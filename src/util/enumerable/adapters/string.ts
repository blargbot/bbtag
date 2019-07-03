import { IterableEnumerable } from './iterable';

export class StringEnumerable extends IterableEnumerable<string> {
    public constructor(source: string) {
        super(source);
    }
}