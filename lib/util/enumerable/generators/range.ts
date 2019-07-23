import { IterableEnumerable } from '../adapters';

export class RangeEnumerable extends IterableEnumerable<number> {
    public static create(start: number, count: number, step: number = 1): RangeEnumerable {
        return new RangeEnumerable(start, count, step);
    }

    public constructor(start: number, count: number, step: number) {
        super(() => _range(start, count, step));
    }
}

function* _range(start: number, count: number, step: number): IterableIterator<number> {
    let current = start;
    for (let i = count; i > 0; i--) {
        yield current;
        current += step;
    }
}