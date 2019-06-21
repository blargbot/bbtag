export abstract class Enumerable<T> {
    public abstract getEnumerator(): Enumerator<T>;

    public toIterable(): Iterable<T> {
        let self = this;
        return {
            [Symbol.iterator]() {
                return self.getEnumerator().toIterator();
            }
        }
    }
}

export abstract class Enumerator<T> {
    public abstract moveNext(): boolean;
    public abstract get current(): T;

    public toIterator(): Iterator<T> {
        let self = this;
        return {
            next(): IteratorResult<T> {
                return {
                    done: !self.moveNext(),
                    value: self.current
                };
            }
        }
    }
}

export declare namespace Enumerable {
    export function from<T>(source: string): Adapters.StringEnumerable;
    export function from<T>(source: T[]): Adapters.ArrayEnumerable<T>;
    export function from<T>(source: ArrayLike<T>): Adapters.ArrayEnumerable<T>;
    export function from<T>(source: Set<T>): Adapters.SetEnumerable<T>;
    export function from<Key, Value>(source: Map<Key, Value>): Adapters.MapEnumerable<Key, Value>;
    export function from<T>(source: Iterable<T>): Adapters.IterableEnumerable<T>;
    export function from<T>(source: Enumerable<T>): T;
    export function from<T>(source: EnumerableSource<T>): Enumerable<T>

    export function empty<T>(): Generators.EmptyEnumerable<T>;
    export function range(start: number, count: number, step?: number): Generators.RangeEnumerable;
    export function infinite(start?: number, step?: number): Generators.InfiniteEnumerable;
    export function repeat<T>(value: T, count: number): Generators.RepeatEnumerable<T>;
    export function concat<T>(other: EnumerableSource<T>, ...others: EnumerableSource<T>[]): Chains.ConcatEnumerable<T>;
}

export interface Enumerable<T> {
    select<TResult>(selector: selector<T, TResult>): Chains.SelectEnumerable<T, TResult>;
    selectMany<TResult>(selector: selector<T, EnumerableSource<TResult>>): Chains.SelectManyEnumerable<T, TResult>;
    where(predicate: predicate<T>): Chains.WhereEnumerable<T>;
    first(predicate?: predicate<T>, defaultValue?: () => T): T;
    single(predicate?: predicate<T>, defaultValue?: () => T): T;
    last(predicate?: predicate<T>, defaultValue?: () => T): T;
    any(predicate?: predicate<T>): boolean;
    all(predicate: predicate<T>): boolean;
    concat(other: EnumerableSource<T>, ...others: EnumerableSource<T>[]): Chains.ConcatEnumerable<T>;
    except(other: EnumerableSource<T>): Chains.ExceptEnumerable<T>;
    take(count: number): Chains.TakeEnumerable<T>;
    take(takeWhile: predicate<T>): Chains.TakeEnumerable<T>;
    skip(count: number): Chains.SkipEnumerable<T>;
    skip(skipWhile: predicate<T>): Chains.SkipEnumerable<T>;
    groupBy<TKey>(selector: selector<T, TKey>): Chains.GroupByEnumerable<T, TKey>;
    sort(comparer: comparer<T>): Chains.OrderEnumerable<T>;
    orderBy<TKey>(selector: (source: T) => TKey, descending?: boolean, comparer?: comparer<TKey>): Chains.OrderEnumerable<T>;

    toArray(): T[];
    toSet(): Set<T>;
}

import * as Adapters from './adapters';
import * as Generators from './generators';
import * as Chains from './chains';
import { selector, predicate, comparer, EnumerableSource } from './types';
import * as Terminators from './terminators';

Enumerable.from = Generators.from;
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
Enumerable.prototype.first = Terminators.first;
Enumerable.prototype.single = Terminators.single;
Enumerable.prototype.last = Terminators.last;
Enumerable.prototype.any = Terminators.any;
Enumerable.prototype.all = Terminators.all;
Enumerable.prototype.toArray = Terminators.toArray;
Enumerable.prototype.toSet = Terminators.toSet;