import { Enumerable, Enumerator } from '..';
import { ArrayEnumerable, IterableEnumerable, IteratorEnumerator, MapEnumerable, SetEnumerable, StringEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export function createEnumerable<T>(source: string): StringEnumerable;
export function createEnumerable<T>(source: T[]): ArrayEnumerable<T>;
export function createEnumerable<T>(source: ArrayLike<T>): ArrayEnumerable<T>;
export function createEnumerable<T>(source: Set<T>): SetEnumerable<T>;
export function createEnumerable<Key, Value>(source: Map<Key, Value>): MapEnumerable<Key, Value>;
export function createEnumerable<T>(source: Iterable<T>): IterableEnumerable<T>;
export function createEnumerable<T extends Enumerable<any>>(source: T): T;
export function createEnumerable<T>(source: EnumerableSource<T>): Enumerable<any>;
export function createEnumerable(source: any): Enumerable<any> {
    if (Array.isArray(source)) {
        return new ArrayEnumerable(source);
    }
    if (typeof source === 'string') {
        return new StringEnumerable(source);
    }
    if (source instanceof Set) {
        return new SetEnumerable(source);
    }
    if (source instanceof Map) {
        return new MapEnumerable(source);
    }
    if (source instanceof Enumerable) {
        return source;
    }
    if (Symbol.iterator in source) {
        return new IterableEnumerable(source);
    }
    if ('length' in source) {
        return new ArrayEnumerable(source);
    }
    throw new Error(`Unable to create an enumerable from ${source}`);
}

export function createEnumerator<T>(source: Iterator<T>): Enumerator<T>;
export function createEnumerator<T extends Enumerator<T>>(source: T): T;
export function createEnumerator(source: any): Enumerator<any> {
    if (source instanceof Enumerator) {
        return source;
    }

    return new IteratorEnumerator(source);
}