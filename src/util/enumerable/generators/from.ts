import { Enumerable } from '..';
import { ArrayEnumerable, IterableEnumerable, MapEnumerable, SetEnumerable, StringEnumerable } from '../adapters';
import { EnumerableSource } from '../types';

export function from<T>(source: string): StringEnumerable;
export function from<T>(source: T[]): ArrayEnumerable<T>;
export function from<T>(source: ArrayLike<T>): ArrayEnumerable<T>;
export function from<T>(source: Set<T>): SetEnumerable<T>;
export function from<Key, Value>(source: Map<Key, Value>): MapEnumerable<Key, Value>;
export function from<T>(source: Iterable<T>): IterableEnumerable<T>;
export function from<T extends Enumerable<any>>(source: T): T;
export function from<T>(source: EnumerableSource<T>): Enumerable<any>;
export function from(source: any): Enumerable<any> {
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