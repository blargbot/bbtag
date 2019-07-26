import { C, EnumerableCtorArg, IDoubleLinkedListNode, IEnumerable, IEnumerator, IGrouping, ILookup, IOrderedEnumerable, ISingleLinkedListNode, P, S, Source } from './linq.types';

export {
    IEnumerable,
    IEnumerator,
    IGrouping,
    ILookup,
    IOrderedEnumerable,
    ISingleLinkedListNode,
    IDoubleLinkedListNode,
    Source,
    EnumerableCtorArg
};

const UNIQUE_KEY: any = {};

const functions = {
    identity(x: any): any { return x; },
    blank(): void { },
    true(): true { return true; },
    false(): false { return false; },
    eq<T>(l: T, r: T): boolean { return comp(l, r) === 0; }
};

function indexed<T>(source: IEnumerable<T>): Iterable<[T, number]> {
    return {
        *[Symbol.iterator](): Iterator<[T, number]> {
            let i = 0;
            for (const element of source) {
                yield [element, i++];
            }
        }
    };
}

function comp<T>(l: T, r: T): number {
    if (l < r) { return -1; }
    if (l > r) { return 1; }
    if (l === r) { return 0; }
    if (typeof l === 'number' && typeof r === 'number' && isNaN(l) && isNaN(r)) { return 0; }
    if (typeof l === 'number' && isNaN(l)) { return 1; }
    if (typeof r === 'number' && isNaN(r)) { return -1; }
    return 0;
}

function isIterable(value: any): value is Iterable<any> {
    return Symbol.iterator in Object(value);
}

export class Enumerable<T> implements IEnumerable<T> {
    // #region Static methods

    public static from<T>(value: Source<T>): IEnumerable<T>;
    public static from(value: Source<any>): IEnumerable<any> {
        switch (typeof value) {
            case 'string':
                return new StringEnumerable(value).asEnumerable();
            case 'function':
                return new Enumerable(value as () => Iterator<any>);
            case 'undefined':
                return EmptyEnumerable;
            case 'object':
                if (Array.isArray(value)) { return new ArrayEnumerable(value); }
                if (value instanceof Enumerable) { return value; }
                if (value instanceof Set) { return new SetEnumerable(value); }
                if (value instanceof Map) { return new MapEnumerable(value).asEnumerable(); }
                if (isIterable(value)) { return new Enumerable(value); }
                if ('length' in value) { return new ArrayLikeEnumerable(value); }
                if ('next' in value) { return new LinkedListEnumerable(value); }
        }
        throw new Error(`Unable to convert ${value} to IEnumerable`);
    }

    public static empty<T>(): IEnumerable<T> { return EmptyEnumerable; }
    public static range(start: number, count: number, step: number = 1): IEnumerable<number> { return new RangeEnumerable(start, count, step); }
    public static repeat<T>(element: T, count: number): IEnumerable<T> { return new RepeatEnumerable(element, count); }
    public static concat<T>(...sources: Array<Source<T>>): IEnumerable<T> { return new ConcatEnumerable(new ArrayEnumerable(sources)); }
    public static isEnumerable<T = any>(value: any): value is Enumerable<T> { return value instanceof Enumerable; }

    // #endregion Static Methods

    // #region Properties

    protected readonly _baseIterable: Iterable<T>;

    // #endregion Properties

    // #region Constructors

    public constructor(source: EnumerableCtorArg<T>) {
        this._baseIterable = typeof source === 'function' ? { [Symbol.iterator]: source } : source;
    }

    // #endregion Constructors

    // #region Structural methods

    public getEnumerator(): Enumerator<T> {
        return this[Symbol.iterator]();
    }

    public [Symbol.iterator](): Enumerator<T> {
        return new Enumerator(this._baseIterable[Symbol.iterator]());
    }

    public [Symbol.toStringTag](): string {
        return Enumerable.name;
    }

    // #endregion Structural methods

    // #region Terminator methods

    public all(this: IEnumerable<boolean>): boolean;
    public all(predicate: S<T, boolean>): boolean;
    public all(predicate: S<T, boolean> = functions.identity): boolean {
        for (const [element, index] of indexed(this)) {
            if (!predicate(element, index)) {
                return false;
            }
        }
        return true;
    }

    public aggregate<R>(aggregator: P<R, T, R>, initial: R): R {
        for (const [element, index] of indexed(this)) {
            initial = aggregator(initial, element, index);
        }
        return initial;
    }

    public any(predicate: S<T, boolean> = functions.true): boolean {
        for (const [element, index] of indexed(this)) {
            if (predicate(element, index)) {
                return true;
            }
        }
        return false;
    }

    public average(selector: S<T, number>): number;
    public average(this: IEnumerable<number>): number;
    public average(selector: S<T, number> = functions.identity): number {
        let total = 0;
        let count = 0;
        for (const args of indexed(this)) {
            total += selector(...args);
            count++;
        }
        if (count === 0) { throw new Error('No elements in sequence'); }
        return total / count;
    }

    public contains(value: T, comparer: P<T, T, boolean> = functions.eq): boolean {
        for (const [element, index] of indexed(this)) {
            if (comparer(value, element, index)) {
                return true;
            }
        }
        return false;
    }

    public count(): number {
        let count = 0;
        for (const _ of this) {
            count++;
        }
        return count;
    }

    public elementAt(index: number): T {
        const result = this.elementAtOr(index, UNIQUE_KEY);
        if (result === UNIQUE_KEY) {
            throw new Error('Index out of range');
        }
        return result;
    }

    public elementAtOr(index: number, value: T): T {
        if (index < 0) { throw new Error('Cannot get a negative index'); }
        for (const element of this) {
            if (index-- === 0) {
                return element;
            }
        }
        return value;
    }

    public first(predicate?: S<T, boolean>): T {
        const result = predicate ? this.firstOr(predicate, UNIQUE_KEY) : this.firstOr(UNIQUE_KEY);
        if (result === UNIQUE_KEY) {
            throw new Error('No element found');
        }
        return result;
    }

    public firstOr(value: T): T;
    public firstOr(predicate: S<T, boolean>, value: T): T;
    public firstOr(...args: [T] | [S<T, boolean>, T]): T {
        const [predicate, value] = args.length === 1 ? [functions.true, args[0]] : args;
        const enumerator = this.where(predicate).getEnumerator();
        return enumerator.moveNext() ? enumerator.current : value;
    }
    public isDataEqual(other: Source<T>): boolean;
    public isDataEqual<K>(other: Source<T>, key: S<T, K>): boolean;
    public isDataEqual<K>(other: Source<T>, key: S<T, K> = functions.identity): boolean {
        const target = this.select(key).toArray();
        for (const [element, i] of indexed(Enumerable.from(other))) {
            const index = target.indexOf(key(element, i));
            if (index === -1) { return false; }
            target.splice(index, 1);
        }
        return target.length === 0;
    }

    public isSequenceEqual(other: Source<T>, compare: P<T, T, boolean> = functions.eq): boolean {
        const [t, o] = [this.getEnumerator(), Enumerable.from(other).getEnumerator()];

        let tMoved = false;
        let i = 0;
        while ((tMoved = t.moveNext()) && o.moveNext()) {
            if (!compare(t.current, o.current, i++)) {
                return false;
            }
        }

        return tMoved ? false : !o.moveNext();
    }

    public isSetEqual(other: Source<T>): boolean;
    public isSetEqual<K>(other: Source<T>, key: S<T, K>): boolean;
    public isSetEqual<K>(other: Source<T>, key: S<T, K> = functions.identity): boolean {
        const l = this.select(key).toSet();
        let allMatched = true;
        const r = Enumerable.from(other).select(key).forEach(k => allMatched = allMatched && l.has(k)).toSet();
        if (r.size !== l.size) { return false; }
        return allMatched;
    }

    public joinString(separator: string = ','): string {
        return this.toArray().join(separator);
    }

    public last(predicate?: S<T, boolean>): T {
        const result = predicate ? this.lastOr(predicate, UNIQUE_KEY) : this.lastOr(UNIQUE_KEY);
        if (result === UNIQUE_KEY) {
            throw new Error('No element found');
        }
        return result;
    }

    public lastOr(value: T): T;
    public lastOr(predicate: S<T, boolean>, value: T): T;
    public lastOr(...args: [T] | [S<T, boolean>, T]): T {
        const [predicate, value] = args.length === 1 ? [functions.true, args[0]] : args;
        const enumerator = this.where(predicate).getEnumerator();
        let result = value;
        while (enumerator.moveNext()) { result = enumerator.current; }
        return result;
    }

    public get length(): number {
        return this.count();
    }

    public max(selector: S<T, number>): number;
    public max(this: IEnumerable<number>): number;
    public max(selector: S<T, number> = functions.identity): number {
        let max: number = Number.MIN_VALUE;
        let empty = true;
        for (const args of indexed(this)) {
            max = Math.max(max, selector(...args));
            empty = false;
        }
        if (empty) { throw new Error('No elements in sequence'); }
        return max;
    }

    public min(selector: S<T, number>): number;
    public min(this: Enumerable<number>): number;
    public min(selector: S<T, number> = functions.identity): number {
        let min = Number.MAX_VALUE;
        let empty = true;
        for (const args of indexed(this)) {
            min = Math.min(min, selector(...args));
            empty = false;
        }
        if (empty) { throw new Error('No elements in sequence'); }
        return min;
    }

    public single(predicate: S<T, boolean> = functions.true): T {
        const result = this.singleOr(predicate, UNIQUE_KEY);
        if (result === UNIQUE_KEY) {
            throw new Error('No element found');
        }
        return result;
    }

    public singleOr(value: T): T;
    public singleOr(predicate: S<T, boolean>, value: T): T;
    public singleOr(...args: [T] | [S<T, boolean>, T]): T {
        const [predicate, value] = args.length === 1 ? [() => true, args[0]] : args;
        const enumerator = this.where(predicate).getEnumerator();
        if (!enumerator.moveNext()) { return value; }
        const result = enumerator.current;
        if (enumerator.moveNext()) { throw new Error('More than 1 element found'); }
        return result;
    }

    public sum(selector: S<T, number>): number;
    public sum(this: IEnumerable<number>): number;
    public sum(selector: S<T, number> = functions.identity): number {
        let total = 0;
        for (const args of indexed(this)) {
            total += selector(...args);
        }
        return total;
    }

    public toArray(): T[] {
        return [...this];
    }

    public toSet(): Set<T> {
        return new Set(this);
    }

    public toSingleLinkedList(): ISingleLinkedListNode<T> | undefined { return this.toDoubleLinkedList(); }
    public toDoubleLinkedList(): IDoubleLinkedListNode<T> | undefined {
        let root: IDoubleLinkedListNode<T> | undefined;
        this.aggregate<IDoubleLinkedListNode<T> | undefined>((prev, cur) => {
            const result: IDoubleLinkedListNode<T> = {
                value: cur,
                previous: prev,
                next: undefined
            };
            prev ? prev.next = result : root = result;
            return result;
        }, undefined);
        return root;
    }

    public toMap<TK, TV>(this: IEnumerable<[TK, TV]>): Map<TK, TV>;
    public toMap<TK, TV>(key: S<T, TK>, value: S<T, TV>): Map<TK, TV>;
    public toMap<TK, TV>(
        key: S<T, TK> = (e: any) => e[0],
        value: S<T, TV> = (e: any) => e[1]
    ): Map<TK, TV> {
        return new Map(this.select((e, i) => [key(e, i), value(e, i)]));
    }

    // #endregion Terminator methods

    // #region FluentApi methods

    public asEnumerable(): IEnumerable<T> { return this; }
    public append(...values: T[]): IEnumerable<T> { return Enumerable.concat(this, new ArrayEnumerable(values)); }
    public buffer(): IEnumerable<T> { return new ArrayEnumerable([...this]); }
    public cache(): IEnumerable<T> { return new CachedEnumerable(this); }
    public concat(...sources: Array<Source<T>>): IEnumerable<T> { return Enumerable.concat(this, ...sources); }
    public defaultIfEmpty(value: T): IEnumerable<T> { return new DefaultIfEmptyEnumerable(this, value); }
    public distinct(): IEnumerable<T> { return this.distinctBy(functions.identity); }
    public distinctBy<K>(key: S<T, K>): IEnumerable<T> { return new DistinctEnumerable(this, key); }
    public except(other: Source<T>): IEnumerable<T> { return this.exceptBy(other, functions.identity); }
    public exceptBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T> { return new ExceptEnumerable(this, Enumerable.from(other), key); }
    public forEach(action: S<T, any>): IEnumerable<T> { return this.select((...args) => { action(...args); return args[0]; }); }
    public flatten<R>(this: IEnumerable<Source<R>>): IEnumerable<R> { return this.selectMany(functions.identity); }
    public groupBy<K>(key: S<T, K>): IEnumerable<IGrouping<T, K>>;
    public groupBy<K, E>(key: S<T, K>, element: S<T, E> = functions.identity): IEnumerable<IGrouping<E, K>> { return new GroupByEnumerable(this, key, element); }
    public groupJoin<R, K, RE>(right: Source<R>, keyLeft: S<T, K>, keyRight: S<R, K>, result: P<T, IEnumerable<R>, RE>): IEnumerable<RE> {
        return new GroupJoinEnumerable(this, Enumerable.from(right), keyLeft, keyRight, result);
    }
    public intersect(other: Source<T>): IEnumerable<T> { return this.intersectBy(other, functions.identity); }
    public intersectBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T> { return new IntersectEnumerable(this, Enumerable.from(other), key); }
    public join<R, K, RE>(right: Source<R>, keyLeft: S<T, K>, keyRight: S<R, K>, result: P<T, R, RE>): IEnumerable<RE> {
        return this.groupJoin(right, keyLeft, keyRight, (l, rs) => rs.select(r => ({ l, r })))
            .selectMany(e => e)
            .select(({ l, r }, i) => result(l, r, i));
    }
    public ofType<R extends T>(type: new (...args: any[]) => R): IEnumerable<R> { return this.where<R>((e: T): e is R => e instanceof type); }
    public orderByAsc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
    public orderByAsc<K>(ks: S<T, K>, c: P<K, K, number, false> = comp): IOrderedEnumerable<T> { return new OrderedEnumerable(this, ks, c); }
    public orderByDesc<K>(key: S<T, K>, comparer?: P<K, K, number, false>): IOrderedEnumerable<T>;
    public orderByDesc<K>(ks: S<T, K>, c: P<K, K, number, false> = comp): IOrderedEnumerable<T> { return this.orderByAsc(ks, c).reverse(); }
    public prepend(...values: T[]): IEnumerable<T> { return Enumerable.concat(new ArrayEnumerable(values), this); }
    public reverse(): IEnumerable<T> { return new ReversedEnumerable<T>(this); }
    public scan<R>(selector: (...args: T[]) => R, width: number): IEnumerable<R> { return new ScanEnumerable(this, selector, width); }
    public select<R>(selector: S<T, R>): IEnumerable<R> { return new SelectEnumerable(this, selector); }
    public selectMany<R>(this: IEnumerable<Source<R>>): IEnumerable<R>;
    public selectMany<R>(selector: S<T, Source<R>>): IEnumerable<R>;
    public selectMany<R>(selector: S<T, Source<R>> = functions.identity): IEnumerable<R> { return new SelectManyEnumerable(this, selector); }
    public skip(count: number): IEnumerable<T> { return this.skipWhile((_, i) => i < count); }
    public skipWhile(predicate: S<T, boolean>): IEnumerable<T> { return new SkipEnumerable(this, predicate); }
    public take(count: number): IEnumerable<T> { return this.takeWhile((_, i) => i < count); }
    public takeWhile(predicate: S<T, boolean>): IEnumerable<T> { return new TakeEnumerable(this, predicate); }
    public toLookup<K>(key: S<T, K>): ILookup<T, K>;
    public toLookup<K, E>(key: S<T, K>, element: S<T, E>): ILookup<E, K>;
    public toLookup(ks: S<T, any>, es: S<T, any> = functions.identity): ILookup<any, any> { return new Lookup(this, ks, es); }
    public union(other: Source<T>): IEnumerable<T> { return this.unionBy(other, functions.identity); }
    public unionBy<K>(other: Source<T>, key: S<T, K>): IEnumerable<T> { return this.concat(other).distinctBy(key); }
    public where(predicate: S<T, boolean>): IEnumerable<T>;
    public where<R extends T>(predicate: C<T, R>): IEnumerable<R>;
    public where(predicate: S<T, boolean>): IEnumerable<T> { return new WhereEnumerable(this, predicate); }
    public zip<O, R>(other: Source<O>, result: P<T, O, R>): IEnumerable<R> { return new ZipEnumerable(this, Enumerable.from(other), result); }

    // #endregion Fluent API methods
}

export class Enumerator<T> implements IEnumerator<T> {
    protected _baseIterator: Iterator<T>;
    private _current!: T;

    public constructor(source: Iterator<T>) {
        this._baseIterator = source;
    }

    public [Symbol.toStringTag](): string {
        return Enumerator.name;
    }

    public get current(): T {
        return this._current;
    }

    public moveNext(): boolean {
        const { done, value } = this._baseIterator.next();
        this._current = value;
        return !done;
    }

    public dispose(): void {
        if (this._baseIterator.return) { this._baseIterator.return(); }
        delete this._current;
    }

    public next(value?: any): IteratorResult<T> {
        return this._baseIterator.next(value);
    }

    public remaining(cache: boolean = true): IEnumerable<T> {
        const result = new Enumerable(() => this);
        return cache ? result.cache() : result;
    }
}

// #region Adapters

export class ArrayLikeEnumerable<T> extends Enumerable<T> {
    public static * reverse<T>(source: ArrayLike<T>): Iterator<T> {
        for (let i = source.length; i > 0;) {
            yield source[--i];
        }
    }

    protected readonly _arrayLike: ArrayLike<T>;

    public constructor(source: ArrayLike<T>) {
        super(function* iterateArrayLike(): Iterator<T> {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < source.length; i++) {
                yield source[i];
            }
        });

        this._arrayLike = source;
    }

    // #region Terminator overrides

    public count(): number { return this._arrayLike.length; }

    public first(predicate?: S<T, boolean>): T {
        if (predicate === undefined && this._arrayLike.length > 0) {
            return this._arrayLike[0];
        }
        return super.first(predicate);
    }

    public firstOr(value: T): T;
    public firstOr(predicate: S<T, boolean>, value: T): T;
    public firstOr(...args: [T] | [S<T, boolean>, T]): T {
        if (args.length === 1) {
            return 0 in this._arrayLike ? this._arrayLike[0] : args[0];
        }
        return super.firstOr(...args);
    }

    public last(predicate?: S<T, boolean>): T {
        if (predicate === undefined && this._arrayLike.length > 0) {
            return this._arrayLike[this._arrayLike.length - 1];
        }
        return super.first(predicate);
    }

    public lastOr(value: T): T;
    public lastOr(predicate: S<T, boolean>, value: T): T;
    public lastOr(...args: [T] | [S<T, boolean>, T]): T {
        if (args.length === 1) {
            const i = this._arrayLike.length - 1;
            return i in this._arrayLike ? this._arrayLike[i] : args[0];
        }
        return super.lastOr(...args);
    }

    public get length(): number { return this._arrayLike.length; }

    // #endregion Terminator overrides

    // #region FluentApi overrides

    public buffer(): IEnumerable<T> { return this; }
    public cache(): IEnumerable<T> { return this; }
    public reverse(): IEnumerable<T> {
        return new ReversedEnumerable(this, () => ArrayLikeEnumerable.reverse(this._arrayLike));
    }

    // #endregion FluentApi overrides
}

class ArrayEnumerable<T> extends ArrayLikeEnumerable<T> {
    protected readonly _arrayLike!: T[];

    public constructor(source: T[]) {
        super(source);
    }
}

class StringEnumerable extends ArrayLikeEnumerable<string> {
    protected readonly _arrayLike!: string;

    public constructor(source: string) {
        super(source);
    }
}

class SetEnumerable<T> extends Enumerable<T> {
    protected readonly _set: Set<T>;

    public constructor(source: Set<T>) {
        super(source);

        this._set = source;
    }

    public count(): number { return this._set.size; }
}

class MapEnumerable<TKey, TElement> extends Enumerable<[TKey, TElement]> {
    protected readonly _map: Map<TKey, TElement>;

    public constructor(source: Map<TKey, TElement>) {
        super(source);

        this._map = source;
    }

    public count(): number { return this._map.size; }
}

class LinkedListEnumerable<T> extends Enumerable<T> {
    public constructor(source: ISingleLinkedListNode<T>) {
        super(function* navigate(): Iterator<T> {
            let current: ISingleLinkedListNode<T> | undefined = source;
            while (current !== undefined) {
                yield current.value;
                current = current.next;
            }
        });
    }
}

// #endregion Adapters

// #region Generators

class RangeEnumerable extends Enumerable<number> {
    protected readonly _start: number;
    protected readonly _count: number;
    protected readonly _step: number;
    protected get _end(): number { return this._count === 0 ? NaN : this._start + this._step * (this._count - 1); }

    public constructor(start: number, count: number, step: number) {
        super(function* range(): Iterator<number> {
            for (let i = 0; i < count; i++) {
                yield start + i * step;
            }
        });

        this._start = start;
        this._count = Math.ceil(count);
        this._step = step;
    }

    // #region Terminator overrides

    public average(selector?: S<number, number>): number {
        return selector === undefined
            ? (this.first() + this.last()) / 2
            : super.average();
    }

    public count(): number { return this._count; }

    public firstOr(value: number): number;
    public firstOr(predicate: S<number, boolean>, value: number): number;
    public firstOr(...args: [number] | [S<number, boolean>, number]): number {
        if (args.length === 1 && this._count > 0) {
            return this._start;
        }
        return super.firstOr(...args as Parameters<Enumerable<number>['firstOr']>);
    }

    public lastOr(value: number): number;
    public lastOr(predicate: S<number, boolean>, value: number): number;
    public lastOr(...args: [number] | [S<number, boolean>, number]): number {
        if (args.length === 1 && this._count > 0) {
            return this._start + this._step * (this._count - 1);
        }
        return super.lastOr(...args as Parameters<Enumerable<number>['lastOr']>);
    }

    public get length(): number { return this._count; }

    public max(selector?: S<number, number>): number {
        return selector === undefined
            ? Math.max(this.first(), this.last())
            : super.max(selector);
    }

    public min(selector?: S<number, number>): number {
        return selector === undefined
            ? Math.min(this.first(), this.last())
            : super.max(selector);
    }

    public sum(selector?: S<number, number>): number {
        return selector === undefined
            ? this.average() * this._count
            : super.average();
    }

    // #endregion Terminator overrides

    // #region FluentApi overrides

    public buffer(): IEnumerable<number> { return this; }
    public cache(): IEnumerable<number> { return this; }
    public reverse(): IEnumerable<number> {
        return new RangeEnumerable(this._end, this._count, this._step * -1);
    }

    // #endregion FluentApi overrides
}

class RepeatEnumerable<T> extends Enumerable<T> {
    public constructor(element: T, count: number) {
        super(function* repeat(): Iterator<T> {
            for (let i = 0; i < count; i++) {
                yield element;
            }
        });
    }

    public reverse(): IEnumerable<T> { return this; }
}

const EmptyEnumerable = new Enumerable(function* empty(): Iterator<any> { });

// #endregion Generators

// #region FluentApi

class CachedEnumerable<T> extends Enumerable<T> {
    protected readonly _enumerator: IEnumerator<T>;
    protected readonly _cache: T[];
    public constructor(source: IEnumerable<T>) {
        const cache: T[] = [];
        const enumerator = source.forEach(e => cache.push(e)).getEnumerator();
        super(function* cacheResult(): Iterator<T> {
            let i = 0;
            while (i < cache.length || enumerator.moveNext()) {
                yield cache[i++];
            }
        });

        this._enumerator = enumerator;
        this._cache = cache;
    }

    public reverse(): IEnumerable<T> {
        return new ReversedEnumerable(this, () => {
            while (this._enumerator.moveNext()) { }
            return ArrayEnumerable.reverse(this._cache);
        });
    }
}

class ConcatEnumerable<T> extends Enumerable<T> {
    protected readonly _sources: IEnumerable<IEnumerable<T>>;

    public constructor(sources: Source<Source<T>>) {
        const _sources = Enumerable.from(sources).select(Enumerable.from).cache();
        super(function* concat(): Iterator<T> {
            for (const source of _sources) {
                yield* source as IEnumerable<T>;
            }
        });

        this._sources = _sources;
    }

    public reverse(): IEnumerable<T> {
        return new ReversedEnumerable(this, new ConcatEnumerable(this._sources.reverse().select(s => s.reverse())));
    }
}

class DefaultIfEmptyEnumerable<T> extends Enumerable<T> {
    public constructor(source: IEnumerable<T>, value: T) {
        super(function* defaultIfEmpty(): Iterator<T> {
            const enumerator = source.getEnumerator();
            if (enumerator.moveNext()) {
                yield enumerator.current;
                yield* enumerator.remaining(false);
            } else {
                yield value;
            }
        });
    }
}

class DistinctEnumerable<T, K> extends Enumerable<T> {
    public constructor(source: IEnumerable<T>, key: S<T, K>) {
        super(function* distinct(): Iterator<T> {
            const bucket = new Set<K>();
            for (const [element, index] of indexed(source)) {
                const _key = key(element, index);
                if (bucket.size < bucket.add(_key).size) {
                    yield element;
                }
            }
        });
    }
}

class ExceptEnumerable<T, K> extends Enumerable<T> {
    protected readonly _source: IEnumerable<T>;
    protected readonly _remove: IEnumerable<T>;
    protected readonly _key: S<T, K>;

    public constructor(source: IEnumerable<T>, remove: IEnumerable<T>, key: S<T, K>) {
        super(function* except(): Iterator<T> {
            const bucket = remove.select(key).toSet();
            for (const [element, index] of indexed(source)) {
                const _key = key(element, index);
                if (!bucket.has(_key)) {
                    yield element;
                }
            }
        });

        this._source = source;
        this._remove = remove;
        this._key = key;
    }
}

class IntersectEnumerable<T, K> extends Enumerable<T> {
    protected readonly _source: IEnumerable<T>;
    protected readonly _allow: IEnumerable<T>;
    protected readonly _key: S<T, K>;

    public constructor(source: IEnumerable<T>, allow: IEnumerable<T>, key: S<T, K>) {
        super(function* except(): Iterator<T> {
            const bucket = allow.select(key).toSet();
            for (const [element, index] of indexed(source)) {
                const _key = key(element, index);
                if (bucket.has(_key)) {
                    yield element;
                }
            }
        });

        this._source = source;
        this._allow = allow;
        this._key = key;
    }
}

class Group<T, K> extends Enumerable<T> implements IGrouping<T, K> {
    public readonly key: K;
    protected readonly _members: T[];
    protected readonly _enumerator: IEnumerator<void>;

    public constructor(members: T[], source: IEnumerator<void>, key: K) {
        super(function* grouping(): Iterator<T> {
            let i = 0;
            while (i < members.length || source.moveNext()) {
                if (i < members.length) {
                    yield members[i++];
                }
            }
        });

        this.key = key;
        this._members = members;
        this._enumerator = source;
    }

    public reverse(): IGrouping<T, K> { return new ReversedGroup(this, this._members, this._enumerator, this.key); }
}

class GroupByEnumerable<T, K, E> extends Enumerable<IGrouping<E, K>> {
    protected readonly _source: IEnumerable<T>;
    protected readonly _key: S<T, K>;
    protected readonly _element: S<T, E>;

    public constructor(source: IEnumerable<T>, key: S<T, K>, element: S<T, E>) {
        super(function* groupBy(): Iterator<IGrouping<E, K>> {
            const cache = new Map<K, E[]>();
            const newGroups = [] as Array<Group<E, K>>;
            const enumerator = new Enumerable(function* createGroups(): Iterator<void> {
                for (const [_element, index] of indexed(source)) {
                    const _key = key(_element, index);
                    const elem = element(_element, index);
                    let keyValues = cache.get(_key);
                    if (!keyValues) {
                        cache.set(_key, keyValues = []);
                        newGroups.push(new Group(keyValues, enumerator, _key));
                    }
                    keyValues.push(elem);
                    yield;
                }
            }).getEnumerator();

            while (enumerator.moveNext()) {
                while (newGroups.length > 0) {
                    yield* newGroups.splice(0, newGroups.length);
                }
            }
        });

        this._source = source;
        this._key = key;
        this._element = element;
    }
}

class GroupJoinEnumerable<L, R, K, RE> extends Enumerable<RE> {
    public constructor(left: IEnumerable<L>, right: IEnumerable<R>, leftKey: S<L, K>, rightKey: S<R, K>, result: P<L, IEnumerable<R>, RE>) {
        super(function* groupJoin(): Iterator<RE> {
            const l = left.getEnumerator();
            if (!l.moveNext()) { return; }
            const lookup = right.toLookup(rightKey);
            let i = 0;
            do {
                yield result(l.current, lookup.get(leftKey(l.current, i)) || Enumerable.empty(), i++);
            } while (l.moveNext());
        });
    }
}

class Lookup<T, K, E> extends Enumerable<IGrouping<E, K>> implements ILookup<E, K> {
    protected readonly _groups: Map<K, IGrouping<E, K>>;
    protected readonly _order: IEnumerable<IGrouping<E, K>>;
    protected readonly _discover: IEnumerator<void>;

    public constructor(source: IEnumerable<T>, key: S<T, K>, element: S<T, E>) {
        super(() => this._order.getEnumerator());
        this._groups = new Map<K, IGrouping<E, K>>();
        this._order = source.groupBy(key, element)
            .forEach(e => this._groups.set(e.key, e))
            .cache();

        this._discover = this._order.select(functions.blank).getEnumerator();
    }

    public get(key: K): IEnumerable<E> | undefined {
        while (!this._groups.has(key) && this._discover.moveNext()) { }
        return this._groups.get(key);
    }

    public has(key: K): boolean {
        while (!this._groups.has(key) && this._discover.moveNext()) { }
        return this._groups.has(key);
    }

    public reverse(): ILookup<E, K> {
        return new ReversedLookup(this, this._order);
    }
}

class OrderedEnumerable<T, K> extends Enumerable<T> implements IOrderedEnumerable<T> {
    private static * keyMap<T, K>(source: IEnumerable<T>, key: S<T, K>): IterableIterator<[T, K]> {
        for (const [element, i] of indexed(source)) {
            yield [element, key(element, i)];
        }
    }

    private static * quickSort<T, K>(source: IterableIterator<[T, K]>, compare: P<K, K, number, false>): IterableIterator<T> {
        const above = [];
        const below = [];
        const equal = [];
        const { value: pivot, done } = source.next();
        if (done) { return; }

        equal.push(pivot[0]);
        for (const value of source) {
            const order = compare(value[1], pivot[1]);
            if (order < 0) {
                below.push(value);
            } else if (order > 0) {
                above.push(value);
            } else {
                equal.push(value[0]);
            }
        }
        switch (below.length) {
            case 0: break;
            case 1: yield below[0][0]; break;
            default: yield* OrderedEnumerable.quickSort(below[Symbol.iterator](), compare);
        }

        yield* equal;

        switch (above.length) {
            case 0: break;
            case 1: yield above[0][0]; break;
            default: yield* OrderedEnumerable.quickSort(above[Symbol.iterator](), compare);
        }
    }

    protected readonly _comparer: P<K, K, number, false>;
    protected readonly _source: IEnumerable<T>;
    protected readonly _key: S<T, K>;

    public constructor(source: IEnumerable<T>, key: S<T, K>, comparer: P<K, K, number, false>) {
        super(function orderBy(): Iterator<T> {
            return OrderedEnumerable.quickSort(OrderedEnumerable.keyMap(source, key), comparer);
        });

        this._comparer = comparer;
        this._source = source;
        this._key = key;
    }

    public orderByAsc<K2>(key: S<T, K2>, comparer?: P<K2, K2, number, false>): IOrderedEnumerable<T> {
        return this._source.orderByAsc(key, comparer);
    }

    public orderByDesc<K2>(key: S<T, K2>, comparer?: P<K2, K2, number, false>): IOrderedEnumerable<T> {
        return this._source.orderByDesc(key, comparer);
    }

    public reverse(): IOrderedEnumerable<T> {
        const result = new OrderedEnumerable(this._source, this._key, (l, r) => this._comparer(l, r) * -1);
        result.reverse = () => this;
        return result;
    }

    public thenByAsc<K2>(key: S<T, K2>, comparer: P<K2, K2, number, false> = comp): IOrderedEnumerable<T> {
        return new OrderedEnumerable<T, [K, K2]>(this._source,
            (e, i) => [this._key(e, i), key(e, i)],
            (l, r) => this._comparer(l[0], r[0]) || comparer(l[1], r[1]));
    }

    public thenByDesc<K2>(key: S<T, K2>, comparer: P<K2, K2, number, false> = comp): IOrderedEnumerable<T> {
        return this.thenByAsc(key, comparer).reverse();
    }

}

class ReversedEnumerable<T, ThisType extends IEnumerable<T> = IEnumerable<T>> extends Enumerable<T> {
    protected readonly _source: ThisType;

    public constructor(source: ThisType, reversed?: EnumerableCtorArg<T>) {
        super(reversed || function* reverse(): Iterator<T> {

        });

        this._source = source;
    }

    public reverse(): ThisType { return this._source; }
}

class ReversedGroup<T, K> extends ReversedEnumerable<T, IGrouping<T, K>> implements IGrouping<T, K> {
    public readonly key: K;

    public constructor(source: IGrouping<T, K>, members: T[], enumerator: IEnumerator<void>, key: K) {
        super(source, function reverse(): Iterator<T> {
            while (enumerator.moveNext()) { }
            return ArrayLikeEnumerable.reverse(members);
        });

        this.key = key;
    }
}

class ReversedLookup<T, K> extends ReversedEnumerable<IGrouping<T, K>, ILookup<T, K>> implements ILookup<T, K> {
    protected readonly _source: ILookup<T, K>;

    public constructor(source: ILookup<T, K>, order: IEnumerable<IGrouping<T, K>>) {
        super(source, () => order.reverse().getEnumerator());

        this._source = source;
    }

    public get(key: K): IEnumerable<T> | undefined { return this._source.get(key); }
    public has(key: K): boolean { return this._source.has(key); }
}

class ScanEnumerable<T, R> extends Enumerable<R> {
    public constructor(source: IEnumerable<T>, selector: (...args: T[]) => R, width: number) {
        super(function* select(): Iterator<R> {
            if (width < 1) { throw new Error('Cannot scan a window of width ' + width); }
            const enumerator = source.getEnumerator();
            const window = [];
            width--;
            while (enumerator.moveNext() && window.length < width) {
                window.push(enumerator.current);
            }

            if (window.length !== width) { return; }

            do {
                window.push(enumerator.current);
                yield selector(...window);
                window.shift();
            } while (enumerator.moveNext());
        });
    }
}

class SelectEnumerable<T, R> extends Enumerable<R> {
    public constructor(source: IEnumerable<T>, selector: S<T, R>) {
        super(function* select(): Iterator<R> {
            for (const [element, index] of indexed(source)) {
                yield selector(element, index);
            }
        });
    }
}

class SelectManyEnumerable<T, R> extends Enumerable<R> {
    public constructor(source: IEnumerable<T>, selector: S<T, Source<R>>) {
        super(function* selectMany(): Iterator<R> {
            for (const [element, index] of indexed(source)) {
                yield* Enumerable.from(selector(element, index));
            }
        });
    }
}

class SkipEnumerable<T> extends Enumerable<T> {
    public constructor(source: IEnumerable<T>, predicate: S<T, boolean>) {
        super(function* skipWhile(): Iterator<T> {
            const enumerator = source.getEnumerator();
            let i = 0;
            while (enumerator.moveNext() && predicate(enumerator.current, i++)) { }
            yield* enumerator.remaining(false);
        });
    }
}

class TakeEnumerable<T> extends Enumerable<T> {
    public constructor(source: IEnumerable<T>, predicate: S<T, boolean>) {
        super(function* takeWhile(): Iterator<T> {
            const enumerator = source.getEnumerator();
            let i = 0;
            while (enumerator.moveNext() && predicate(enumerator.current, i++)) {
                yield enumerator.current;
            }
        });
    }
}

class WhereEnumerable<T> extends Enumerable<T> {
    public constructor(source: IEnumerable<T>, predicate: S<T, boolean>) {
        super(function* where(): Iterator<T> {
            for (const [element, index] of indexed(source)) {
                if (predicate(element, index)) {
                    yield element;
                }
            }
        });
    }
}

class ZipEnumerable<T1, T2, R> extends Enumerable<R> {
    public constructor(left: IEnumerable<T1>, right: IEnumerable<T2>, result: P<T1, T2, R>) {
        super(function* zip(): Iterator<R> {
            const [l, r] = [left.getEnumerator(), right.getEnumerator()];
            let i = 0;
            while (l.moveNext() && r.moveNext()) {
                yield result(l.current, r.current, i++);
            }
        });
    }
}

// #endregion FluentApi

export default Enumerable;