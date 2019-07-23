import { IterableEnumerable } from '../adapters';

export class RepeatEnumerable<T> extends IterableEnumerable<T> {
    public static create<T>(value: T, count: number): RepeatEnumerable<T> {
        return new RepeatEnumerable(value, count);
    }

    public constructor(value: T, count: number) {
        super(() => _repeat(value, count));
    }
}

function* _repeat<T>(value: T, count: number): IterableIterator<T> {
    for (let i = 0; i < count; i++) {
        yield value;
    }
}