export type EnumerableCtorArg<T> = Iterable<T> | ((this: undefined) => Iterator<T>);
export type Source<T> =
    | IEnumerable<T>
    | Set<T>
    | T[]
    | (T extends [infer MK, infer MV] ? Map<MK, MV> : never)
    | ArrayLike<T>
    | (T extends string ? string : never)
    | EnumerableCtorArg<T>
    | ISingleLinkedListNode<T>
    | IDoubleLinkedListNode<T>

export type S<T, R, _ extends true = true> = _ extends true ? (element: T, index: number) => R : never;
export type C<T, R extends T, _ extends true = true> = _ extends true ? (element: T, index: number) => element is R : never;
export type P<T1, T2, R, _ extends boolean = true> = _ extends true ? (previous: T1, current: T2, index: number) => R : (previous: T1, current: T2) => R;

export interface IEnumerable<T> extends Iterable<T> {
    getEnumerator(): IEnumerator<T>;

    // #region Terminators

    all(predicate: S<T, boolean>): boolean;
    all(this: IEnumerable<boolean>): boolean;
    aggregate<R>(aggregator: P<R, T, R>, initial: R): R;
    any(predicate?: S<T, boolean>): boolean;
    average(selector: S<T, number>): number;
    average(this: IEnumerable<number>): number;
    contains(value: T, comparer?: P<T, T, boolean>): boolean;
    count(): number;
    elementAt(index: number): T;
    first(predicate?: S<T, boolean>): T;
    firstOr(value: T): T;
    firstOr(predicate: S<T, boolean>, value: T): T;
    joinString(separator?: string): string;
    last(predicate?: S<T, boolean>): T;
    lastOr(value: T): T;
    lastOr(predicate: S<T, boolean>, value: T): T;
    readonly length: number;
    max(selector: S<T, number>): number;
    max(this: IEnumerable<number>): number;
    min(selector: S<T, number>): number;
    min(this: IEnumerable<number>): number;
    sequenceEqual(other: Source<T>, comparer?: P<T, T, boolean>): boolean;
    single(predicate?: S<T, boolean>): T;
    singleOr(value: T): T;
    singleOr(predicate: S<T, boolean>, value: T): T;
    sum(selector: S<T, number>): number;
    sum(this: IEnumerable<number>): number;
    toArray(): T[];
    toSet(): Set<T>;
    toSingleLinkedList(): ISingleLinkedListNode<T> | undefined;
    toDoubleLinkedList(): IDoubleLinkedListNode<T> | undefined;
    toMap<TK, TV>(this: IEnumerable<[TK, TV]>): Map<TK, TV>;
    toMap<TK, TV>(key: S<T, TK>, value: S<T, TV>): Map<TK, TV>;

    // #endregion Terminators

    // #region Chains

    append(...values: T[]): IEnumerable<T>;
    buffer(): IEnumerable<T>;
    concat(...sources: Array<Source<T>>): IEnumerable<T>;
    cache(): IEnumerable<T>;
    distinct(): IEnumerable<T>;
    distinctBy<K>(key: S<T, K>): IEnumerable<T>;
    except(other: Source<T>): IEnumerable<T>;
    exceptBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T>;
    forEach(action: S<T, any>): IEnumerable<T>;
    flatten<R>(this: IEnumerable<Source<R>>): IEnumerable<R>;
    groupBy<K>(key: S<T, K>): IEnumerable<IGrouping<T, K>>;
    groupBy<K, E>(key: S<T, K>, element: S<T, E>): IEnumerable<IGrouping<E, K>>;
    groupJoin<R, K, RE>(right: Source<R>, keyLeft: S<T, K>, keyRight: S<R, K>, result: P<T, IEnumerable<R>, RE>): IEnumerable<RE>;
    intersect(other: Source<T>): IEnumerable<T>;
    intersectBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T>;
    join<R, K, RE>(right: Source<R>, keyLeft: S<T, K>, keyRight: S<R, K>, result: P<T, R, RE>): IEnumerable<RE>;
    ofType<R extends T>(type: new (...args: any[]) => R): IEnumerable<R>;
    orderByAsc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
    orderByDesc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
    prepend(...values: T[]): IEnumerable<T>;
    reverse(): IEnumerable<T>;
    scan<R>(selector: (...args: T[]) => R, width: number): IEnumerable<R>;
    select<R>(selector: S<T, R>): IEnumerable<R>;
    selectMany<R>(selector: S<T, Source<R>>): IEnumerable<R>;
    skip(count: number): IEnumerable<T>;
    skipWhile(predicate: S<T, boolean>): IEnumerable<T>;
    take(count: number): IEnumerable<T>;
    takeWhile(predicate: S<T, boolean>): IEnumerable<T>;
    toLookup<K>(key: S<T, K>): ILookup<T, K>;
    toLookup<K, E>(key: S<T, K>, element: S<T, E>): ILookup<E, K>;
    union(other: Source<T>): IEnumerable<T>;
    unionBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T>;
    where(predicate: S<T, boolean>): IEnumerable<T>;
    where<R extends T>(predicate: C<T, R>): IEnumerable<R>;
    zip<O, R>(other: Source<O>, result: P<T, O, R>): IEnumerable<R>;

    // #endregion Chains

}

export interface IGrouping<T, K> extends IEnumerable<T> {
    readonly key: K;
    reverse(): IGrouping<T, K>;
}

export interface ILookup<T, K> extends IEnumerable<IGrouping<T, K>> {
    get(key: K): IEnumerable<T> | undefined;
    has(key: K): boolean;
    reverse(): ILookup<T, K>;
}

export interface IOrderedEnumerable<T> extends IEnumerable<T> {
    reverse(): IOrderedEnumerable<T>;
    thenByAsc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
    thenByDesc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
}

export interface IEnumerator<T> extends Iterator<T> {
    readonly current: T;
    moveNext(): boolean;
    dispose(): void;

    remaining(cache?: boolean): IEnumerable<T>;
}

export interface ISingleLinkedListNode<T> {
    next: ISingleLinkedListNode<T> | undefined;
    value: T
}

export interface IDoubleLinkedListNode<T> extends ISingleLinkedListNode<T> {
    next: IDoubleLinkedListNode<T> | undefined;
    previous: IDoubleLinkedListNode<T> | undefined;
}