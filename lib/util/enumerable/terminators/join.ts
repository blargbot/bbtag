import { Enumerable } from '..';

export function join<T>(this: Enumerable<T>, separator: string): string {
    const elements = this.select(e => '' + e);
    let result = elements.first(undefined, () => '');
    for (const element of elements.skip(1)) {
        result += separator + element;
    }
    return result;
}