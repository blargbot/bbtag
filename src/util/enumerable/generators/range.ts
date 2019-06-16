import { IterableEnumerable } from '../adapters';

export class RangeEnumerable extends IterableEnumerable<number> {
    public constructor(start: number, count: number, step: number) {
        super({ [Symbol.iterator]() { return _range(start, count, step); } });
    }

    public static create(start: number, count: number, step = 1): RangeEnumerable {
        return new RangeEnumerable(start, count, step);
    }
}

function* _range(start: number, count: number, step: number) {
    let current = start;
    for (let i = count; i > 0; i--) {
        yield current;
        current += step;
    }
}