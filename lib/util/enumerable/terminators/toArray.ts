import { Enumerable } from '..';

export function toArray<T>(this: Enumerable<T>): T[] {
    return [...this];
}