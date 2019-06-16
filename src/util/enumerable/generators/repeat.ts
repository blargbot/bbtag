import { IterableEnumerable } from '../adapters';

export class RepeatEnumerable<T> extends IterableEnumerable<T> {
    public constructor(value: T, count: number) {
        super({ [Symbol.iterator]() { return _repeat(value, count); } });
    }

    public static create<T>(value: T, count: number): RepeatEnumerable<T> {
        return new RepeatEnumerable(value, count);
    }
}

function* _repeat<T>(value: T, count: number) {
    for (var i = 0; i < count; i++) {
        yield value;
    }
}