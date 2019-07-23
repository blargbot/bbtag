export { EnumerableSource, predicateFunc, comparerFunc, selectorFunc } from './types';

// Due to circular dependencies, the classes must be defined before the import statements are called.
export abstract class Enumerable<T> implements Iterable<T> {
    public abstract getEnumerator(): Enumerator<T>;

    public [Symbol.iterator](): Iterator<T> {
        return this.getEnumerator();
    }
}

export abstract class Enumerator<T> implements Iterator<T> {
    public abstract moveNext(): boolean;
    public abstract get current(): T;

    public next(): IteratorResult<T> {
        return {
            done: !this.moveNext(),
            value: this.current
        };
    }
}

// This pattern of declaring is required due to circular dependencies
// tslint:disable-next-line: no-namespace
export declare namespace Enumerable {
    export function from<T>(source: string): Adapters.StringEnumerable;
    export function from<T>(source: T[]): Adapters.ArrayEnumerable<T>;
    export function from<T>(source: ArrayLike<T>): Adapters.ArrayEnumerable<T>;
    export function from<T>(source: Set<T>): Adapters.SetEnumerable<T>;
    export function from<Key, Value>(source: Map<Key, Value>): Adapters.MapEnumerable<Key, Value>;
    export function from<T>(source: Iterable<T>): Adapters.IterableEnumerable<T>;
    export function from<T extends Enumerable<any>>(source: T): T;
    export function from<T>(source: EnumerableSource<T>): Enumerable<T>;

    export function empty<T>(): Generators.EmptyEnumerable<T>;
    export function range(start: number, count: number, step?: number): Generators.RangeEnumerable;
    export function infinite(start?: number, step?: number): Generators.InfiniteEnumerable;
    export function repeat<T>(value: T, count: number): Generators.RepeatEnumerable<T>;
    export function concat<T>(other: EnumerableSource<T>, ...others: Array<EnumerableSource<T>>): Chains.ConcatEnumerable<T>;
}

// tslint:disable-next-line: no-namespace
export declare namespace Enumerator {
    export function from<T>(source: Iterator<T>): Adapters.IteratorEnumerator<T>;
    export function from<T extends Enumerator<any>>(source: T): T;
}

// This pattern of declaring is required due to circular dependencies
// tslint:disable-next-line: interface-name
export interface Enumerable<T> {
    select<TResult>(selector: selectorFunc<T, TResult>): Chains.SelectEnumerable<T, TResult>;
    selectMany<TResult>(selector: selectorFunc<T, EnumerableSource<TResult>>): Chains.SelectManyEnumerable<T, TResult>;
    where(predicate: predicateFunc<T>): Chains.WhereEnumerable<T>;
    where<S extends T>(predicate: predicateIsFunc<T, S>): Chains.WhereEnumerable<S>;
    first(predicate?: predicateFunc<T>, defaultValue?: () => T): T;
    single(predicate?: predicateFunc<T>, defaultValue?: () => T): T;
    last(predicate?: predicateFunc<T>, defaultValue?: () => T): T;
    any(predicate?: predicateFunc<T>): boolean;
    all(predicate: predicateFunc<T>): boolean;
    concat(other: EnumerableSource<T>, ...others: Array<EnumerableSource<T>>): Chains.ConcatEnumerable<T>;
    except(other: EnumerableSource<T>): Chains.ExceptEnumerable<T>;
    take(count: number): Chains.TakeEnumerable<T>;
    take(takeWhile: predicateFunc<T>): Chains.TakeEnumerable<T>;
    skip(count: number): Chains.SkipEnumerable<T>;
    skip(skipWhile: predicateFunc<T>): Chains.SkipEnumerable<T>;
    groupBy<TKey>(selector: selectorFunc<T, TKey>): Chains.GroupByEnumerable<T, TKey>;
    sort(comparer: comparerFunc<T>): Chains.OrderEnumerable<T>;
    orderBy<TKey>(selector: (source: T) => TKey, descending?: boolean, comparer?: comparerFunc<TKey>): Chains.OrderEnumerable<T>;
    zip<TOther, TResult>(other: EnumerableSource<TOther>, selector: (left: T, right: TOther) => TResult): Chains.ZipEnumerable<T, TOther, TResult>;
    join(separator: string): string;
    equivalentTo(other: EnumerableSource<T>, checkOrder?: boolean): boolean;
    sequenceEqual(other: EnumerableSource<T>): boolean;

    toArray(): T[];
    toSet(): Set<T>;
}

import * as Adapters from './adapters';
import * as Chains from './chains';
import * as Generators from './generators';
import * as Terminators from './terminators';
import { comparerFunc, EnumerableSource, predicateFunc, predicateIsFunc, selectorFunc } from './types';
export { IterableEnumerable, IteratorEnumerator } from './adapters';

Enumerable.from = Generators.createEnumerable;
Enumerable.empty = Generators.EmptyEnumerable.create;
Enumerable.range = Generators.RangeEnumerable.create;
Enumerable.infinite = Generators.InfiniteEnumerable.create;
Enumerable.repeat = Generators.RepeatEnumerable.create;
Enumerable.concat = Chains.ConcatEnumerable.create;

Enumerable.prototype.select = Chains.SelectEnumerable.create;
Enumerable.prototype.selectMany = Chains.SelectManyEnumerable.create;
Enumerable.prototype.where = Chains.WhereEnumerable.create;
Enumerable.prototype.concat = Chains.ConcatEnumerable.create;
Enumerable.prototype.except = Chains.ExceptEnumerable.create;
Enumerable.prototype.skip = Chains.SkipEnumerable.create;
Enumerable.prototype.take = Chains.TakeEnumerable.create;
Enumerable.prototype.groupBy = Chains.GroupByEnumerable.create;
Enumerable.prototype.sort = Chains.OrderEnumerable.sort;
Enumerable.prototype.orderBy = Chains.OrderEnumerable.orderBy;
Enumerable.prototype.zip = Chains.ZipEnumerable.create;
Enumerable.prototype.first = Terminators.first;
Enumerable.prototype.single = Terminators.single;
Enumerable.prototype.last = Terminators.last;
Enumerable.prototype.any = Terminators.any;
Enumerable.prototype.all = Terminators.all;
Enumerable.prototype.toArray = Terminators.toArray;
Enumerable.prototype.toSet = Terminators.toSet;
Enumerable.prototype.join = Terminators.join;
Enumerable.prototype.equivalentTo = Terminators.equivalentTo;
Enumerable.prototype.sequenceEqual = Terminators.sequenceEqual;

Enumerator.from = Generators.createEnumerator;