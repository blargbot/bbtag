import { Enumerable } from '..';

export function toSet<T>(this: Enumerable<T>): Set<T> {
    return new Set(this);
}