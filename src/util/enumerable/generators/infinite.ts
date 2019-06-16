import { IterableEnumerable } from '../adapters';

export class InfiniteEnumerable extends IterableEnumerable<number> {
    public constructor(start: number, step: number) {
        super({ [Symbol.iterator]() { return _infinite(start, step); } });
    }

    public static create(start = 0, step = 1): InfiniteEnumerable {
        return new InfiniteEnumerable(start, step);
    }
}

function* _infinite(start: number, step: number) {
    let current = start;
    while (true) {
        yield current;
        current += step;
    }
}