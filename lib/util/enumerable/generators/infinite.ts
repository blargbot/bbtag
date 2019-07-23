import { IterableEnumerable } from '../adapters';

export class InfiniteEnumerable extends IterableEnumerable<number> {
    public static create(start: number = 0, step: number = 1): InfiniteEnumerable {
        return new InfiniteEnumerable(start, step);
    }

    public constructor(start: number, step: number) {
        super(() => _infinite(start, step));
    }
}

function* _infinite(start: number, step: number): IterableIterator<number> {
    let current = start;
    while (true) {
        yield current;
        current += step;
    }
}