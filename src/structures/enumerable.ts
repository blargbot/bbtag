type reduction<T, R> = (previous: R, current: T, index: number) => R;
type mapping<T, R> = (value: T, index: number) => R;
type keySelector<T, K> = (value: T) => K;
type predicate<T> = mapping<T, boolean>;
type comparer<T> = (left: T, right: T) => number;
type equality<T> = (left: T, right: T) => boolean | number;
type EnumerableSource<T> = Iterable<T> | (() => Iterator<T>);
type typeGuard<T, R extends T> = (value: T, index: number) => value is R;

const secret = {} as any;
const iterableType = Symbol('IterableType');

/**
 * A wrapper class for any iterable instance or generator function. This provides functions to allow efficent navigation through
 * iterable instances, ensuring the minimal number of iterations are performed by whatver utilises this class.
 * 
 * Many methods on this class are marked with `Deferred Method` which means their operation is delayed until it is needed by another
 * method. `Deferred Method`s do not perform an action until an `Immediate Method` is called. `Immediate Method`s only evaluate the Enumerable
 * as far as is needed to complete their function. e.g. `Enumerable.first()` will only go 1 element into the Enumerable.
 */
export class Enumerable<T> implements Iterable<T> {
    /**
     * Attempts to produce an Enumerable<string> instance from the given `source`.
     * @param source The string to generate from
     */
    public static from(source: string): Enumerable<string>;
    /**
     * Attempts to produce an Enumerable<number> instance from the given `source`.
     * @param source The number to generate from
     */
    public static from(source: number): Enumerable<number>;
    /**
     * Attempts to produce an Enumerable<boolean> instance from the given `source`.
     * @param source The boolean to generate from
     */
    public static from(source: boolean): Enumerable<boolean>;
    /**
     * Attempts to produce an Enumerable<undefined> instance from the given `source`.
     * @param source The undefined to generate from
     */
    public static from(source: undefined): Enumerable<undefined>;
    /**
     * Attempts to produce an Enumerable<null> instance from the given `source`.
     * @param source The null to generate from
     */
    public static from(source: null): Enumerable<null>;
    /**
     * Attempts to produce an Enumerable<T> instance from the given `source`.
     * @param source The Iterable<T> to generate from
     */
    public static from<T>(source: EnumerableSource<T>): Enumerable<T>;
    public static from(source: any): Enumerable<any> {
        switch (typeof source) {
            case 'number':
            case 'boolean': return new Enumerable([source]);
            case 'string': return new Enumerable(Array.from(source));
            case 'undefined': return Enumerable.empty();
            case 'function':
                if (source.length === 0) return new Enumerable(source);
            case 'object':
                if (source[iterableType] === Enumerable) return source;
                if (source instanceof Array) return new ArrayEnumerable(source);
                if (source instanceof Set) return new SetEnumerable(source);
                if (Symbol.iterator in source) return new Enumerable(source);
                if (source === null) return Enumerable.empty();
        }
        throw new InvalidEnumerableSource(source);
    }

    /**
     * `Deferred Method` Creates an Enumerable<number> instance which contains `count` elements starting at `from` in increments of `step`
     * @param from The value to start from (inclusive)
     * @param count The number of elements to generate
     * @param step The difference between one element and the next
     */
    public static range(from: number, count: number, step: number = 1): Enumerable<number> {
        return new Enumerable(function* () {
            let current = from;
            if (count > 0)
                yield from;
            for (let i = 1; i < count; count++)
                yield current += step;
        });
    }

    /**
     * Returns the singleton instance of an empty enumerable.
     */
    public static empty<T>(): Enumerable<T> { return empty; }

    public static concat<T>(...sources: EnumerableSource<T>[]): Enumerable<T> { return concat(Enumerable.empty<T>(), ...sources); }

    /** Iterator */
    *[Symbol.iterator](): Iterator<T> { }
    /** IsConcatSpreadable */
    [Symbol.isConcatSpreadable] = true;
    /** ToStringTag */
    [Symbol.toStringTag]() { return 'Enumerable'; }
    /** Enumerable */
    [iterableType] = Enumerable;

    /**
     * Constructs a new Enumerable<T> which wraps the given source. The source may be any Iterable<T> or a generator function
     * @param source The underlying source to wrap
     */
    public constructor(source: EnumerableSource<T>) {
        this[Symbol.iterator] = getIteratorFunc(source);
    }

    /**
     * `Deferred Method` Returns an Enumerable where each element is directly mapped from `this` in a 1:1 fashion
     * @param mapping The mapping to apply to each element in the Enumerable<T>
     */
    public map<R>(mapping: mapping<T, R>): Enumerable<R> { return map(this, mapping); }

    /**
     * `Deferred Method` Returns an Enumerable where each element from `this` is contained within a collection returned by mapping the original collection.
     * Useful for flattening an Enumerable of Iterables
     * @param mapping The mapping to apply to each element and then to expand
     */
    public mapMany<R>(mapping: mapping<T, Iterable<R>>): Enumerable<R> { return mapMany(this, mapping); }

    /**
     * `Deferred Method` Returns an Enumerable containing elements from `this` where `predicate(element, index)` returned `true`
     * @param predicate The predicate to use
     */

    public filter(predicate: predicate<T>): Enumerable<T>;
    /**
     * `Deferred Method` Returns an Enumerable containing elements from `this` where `predicate(element, index)` returned `true`
     * @param predicate The predicate to use
     */
    public filter<R extends T>(predicate: typeGuard<T, R>): Enumerable<R>;
    public filter(predicate: predicate<T>): Enumerable<T>;
    public filter(predicate: predicate<T>): Enumerable<T> { return filter(this, predicate); }

    /**
     * `Deferred Method` Returns an Enumerable containing the unique elements of `this`, as determined by the `comparer`
     * @param comparer The method used to determine if two elements are equal
     */
    public distinct(comparer?: equality<T>): Enumerable<T> { return distinct(this, comparer); }

    /**
     * `Deferred Method` Returns an Enumerable from `this` where its elements are ordered as determined by `comparer` and `descending`
     * @param comparer The method to use to determine the relative positioning of 2 elements
     * @param descending Should the result be ordered in a descending manner. Defaults to false.
     */
    public sort(comparer?: comparer<T>, descending?: boolean): Enumerable<T> { return sort(this, comparer, v => v, descending); }

    /**
     * `Deferred Method` Returns an Enumerable from `this` where its elements are ordered by a key produced by `keySelector`. 
     * The order is determined by `comparer` and `descending`
     * @param keySelector The method used to select the key of each element
     * @param comparer The method to use to determine the relative positioning of 2 elements
     * @param descending Should the result be ordered in a descending manner. Defaults to false.
     */
    public sortBy<K>(keySelector: keySelector<T, K>, comparer?: comparer<K>, descending?: boolean): Enumerable<T> { return sort(this, comparer, keySelector, descending); }

    /**
     * `Deferred Method` Returns an Enumerable where its elements are the reverse of `this`
     */
    public reverse(): Enumerable<T> { return reverse(this); }

    /**
     * `Deferred Method` Returns an Enumerable<Group> where each Group contains all elements from `this` with the same key
     * @param keySelector The key selector used to determine how to group elements
     */
    public group<K>(keySelector: keySelector<T, K>): Enumerable<Group<T, K>> { return new Enumerable(this.toMap(keySelector)).map(v => new Group(v[1], v[0])); }

    /**
     * `Deferred Method` Returns an Enumerable starting from the first element that returned `false` from `predicate`
     * @param predicate The predicate to use
     */
    public skipWhile(predicate: predicate<T>): Enumerable<T> { return skipWhile(this, predicate); }

    /**
     * `Deferred Method` Returns an Enumerable starting `count` elements from the start of `this`
     * @param count The number of elements to skip
     */
    public skip(count: number): Enumerable<T> { return skipWhile(this, (_, i) => i < count); }

    /**
     * `Deferred Method` Returns an Enumerable containing all elements between `start` and `end` from `this`
     * @param start The element position to start at
     * @param end The element position to end at
     */
    public slice(start: number, end: number): Enumerable<T> { return this.skip(start).take(end - start); }

    /**
     * `Deferred Method` Returns an Enumerable containing all the elements from `this`, until `predicate` returns false.
     * All elements after this point are ignored
     * @param predicate The predicate to use
     */
    public takeWhile(predicate: predicate<T>): Enumerable<T>;
    public takeWhile<R extends T>(predicate: typeGuard<T, R>): Enumerable<R>;
    public takeWhile(predicate: predicate<T>): Enumerable<T> { return takeWhile(this, predicate); }

    /**
     * `Deferred Method` Returns an Enumerable containing the first `count` elements of `this`
     * @param count The number of elements to take
     */
    public take(count: number): Enumerable<T> { return takeWhile(this, (_, i) => i < count); }

    /**
     * `Deferred Method` Returns an Enumerable containing the elements of `this` except those contained in `exceptions`
     * @param exceptions The elements to exclude
     * @param comparer The method used to determine if two elements are equal
     */
    public except(exceptions: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> { return except(this, exceptions, comparer); }

    /**
     * `Deferred Method` Returns an Enumerable containing all the elements from `this` and then every element from
     * each `source` in the order they were supplied.
     * @param sources The sources to concat
     */
    public concat<R>(...sources: EnumerableSource<R>[]): Enumerable<T | R> { return concat(this, ...sources); }

    /**
     * `Deferred Method` Returns an Enumerable containing all the elements from `this` and then each `value` provided
     * @param values The values to append
     */
    public append<R>(...values: R[]): Enumerable<T | R> { return concat(this, values); }

    /**
     * `Deferred Method` Returns an Enumerable containing each `value` provided and then all the elements from `this`
     * @param values The values to append
     */
    public prepend<R>(...values: R[]): Enumerable<T | R> { return concat(values, this); }

    /**
     * `Deferred Method` Returns an Enumerable containing all the elements in `this` and the `source` without duplicates
     * @param source The source to union with
     * @param comparer The method used to determine if two elements are equal
     */
    public union(source: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> { return union(this, source, comparer); }

    /**
     * `Deferred Method` Returns an Enumerable containing all the elements which appear in both `this` and `source`
     * @param source The source to intersect with
     * @param comparer The method used to determine if two elements are equal
     */
    public intersect(source: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> { return intersect(this, source, comparer); }

    /**
     * `Deferred Method` Returns an Enumerable where each element is directly mapped from `this` in a 1:1 fashion.
     * 
     * This is a direct alias for the `map` method
     * @param mapping The mapping to apply to each element in the Enumerable<T>
     */
    public select<R>(mapping: mapping<T, R>): Enumerable<R> { return this.map(mapping); }

    /**
     * `Deferred Method` Returns an Enumerable where each element from `this` is contained within a collection returned by mapping the original collection.
     * Useful for flattening an Enumerable of Iterables
     * 
     * This is a direct alias for the `mapMany` method
     * @param mapping The mapping to apply to each element and then to expand
     */
    public selectMany<R>(mapping: mapping<T, Iterable<R>>): Enumerable<R> { return this.mapMany(mapping); }

    /**
     * `Deferred Method` Returns an Enumerable containing elements from `this` where `predicate(element, index)` returned `true`
     * 
     * This is a direct alias for the `filter` method
     * @param predicate The predicate to use
     */
    public where(predicate: predicate<T>): Enumerable<T>;
    public where<R extends T>(predicate: typeGuard<T, R>): Enumerable<R>;
    public where(predicate: predicate<T>): Enumerable<T> { return this.filter(predicate); }

    /**
     * `Deferred Method` Returns an Enumerable wrapping the generator you provided.
     * @param generator The generator method to use
     */
    public generate<R>(generator: (this: this) => IterableIterator<R>): Enumerable<R> {
        return new Enumerable(generator.bind(this));
    }

    /**
     * `Immediate Method` Returns an Enumerable containing all the elements from `this`. This should be used if you want to create an evaluated
     * Enumerable from a `Deferred Method` call
     */
    public exhaust(): Enumerable<T> { return new ArrayEnumerable([...this]); }

    /**
     * `Immediate Method` Returns an Array containing all the elements from `this` in order.
     */
    public toArray(): Array<T> { return [...this]; }

    /**
     * `Immediate Method` Returns a Map from `this` using `keySelector` to determine the key
     * @param keySelector The key selector
     */
    public toMap<K>(keySelector: keySelector<T, K>): Map<K, T[]> {
        return this.reduce((map, value) => {
            let key = keySelector(value);
            let values = map.get(key);
            if (values) values.push(value);
            else map.set(key, [value]);
            return map;
        }, new Map<K, T[]>());
    }

    /**
     * `Immediate Method` Returns a string containing every element from `this` separated by `separator`
     * @param separator The separator to use. Defaults to `,`
     */
    public join(separator?: string): string {
        let result = '';
        separator = separator || ',';
        for (const value of this)
            result += value + separator;
        return result.substring(0, result.length - separator.length);
    }

    /**
     * `Immediate Method` Calls the `reducer` for every element in `this`. The result of `reducer` is used as the `previous` value for the next `reducer` call.
     * @param reducer The function used to reduce the Enumerable
     * @param initial The initial value used for the `previous` value of the reducer
     */
    public reduce<R>(reducer: reduction<T, R>, initial?: R): R {
        let i = 0;
        for (const value of this)
            initial = reducer(<R>initial, value, i++);
        return <R>initial;
    }

    /**
     * `Immediate Method` Returns the first element in `this` which matches `predicate`, or `defaultvalue` if there was no match.
     * If `predicate` is not provided then the first element is returned.
     * @param predicate The predicate to use
     * @param defaultValue The value to return if nothing matches `predicate`
     */
    public first(): T | undefined;
    public first(predicate?: predicate<T>): T | undefined;
    public first<R extends T>(predicate?: typeGuard<T, R>): R | undefined;
    public first<R extends T>(predicate?: typeGuard<T, R>, defaultValue?: R): R | undefined;
    public first(predicate?: predicate<T>, defaultValue?: T): T | undefined;
    public first(predicate?: predicate<T>, defaultValue?: T): T | undefined {
        for (const value of filter(this, predicate))
            return value;
        return defaultValue;
    }

    /**
     * `Immediate Method` Returns the last element in `this` which matches `predicate`, or `defaultvalue` if there was no match.
     * If `predicate` is not provided then the last element is returned.
     * @param predicate The predicate to use
     * @param defaultValue The value to return if nothing matches `predicate`
     */
    public last(): T | undefined;
    public last(predicate?: predicate<T>): T | undefined;
    public last<R extends T>(predicate?: typeGuard<T, R>): R | undefined;
    public last<R extends T>(predicate?: typeGuard<T, R>, defaultValue?: R): R | undefined;
    public last(predicate?: predicate<T>, defaultValue?: T): T | undefined;
    public last(predicate?: predicate<T>, defaultValue?: T): T | undefined {
        for (const value of filter(this, predicate))
            defaultValue = value;
        return defaultValue;
    }

    /**
     * `Immediate Method` Returns the element located at `position` in `this`
     * @param position The position of the element to return
     */
    public get(position: number): T | undefined { return this.skip(position).first(); }

    /**
     * `Immediate Method` Returns `true` if any element in `this` matches the `predicate`. Otherwise `false`
     * @param predicate The predicate to use
     */
    public any(predicate: predicate<T>): boolean { return this.first(predicate, secret) !== secret; }

    /**
     * `Immediate Method` Returns `true` if all elements in `this` match the `predicate`. Otherwise `false`
     * @param predicate The predicate to use
     */
    public all<R extends T>(predicate: typeGuard<T, R>): this is Enumerable<R>;
    public all(predicate: predicate<T>): boolean;
    public all(predicate: predicate<T>): boolean { return this.first((v, i) => !predicate(v, i), secret) === secret; }

    /**
     * `Immediate Method` Returns `true` if `value` is located inside `this`. Otherwise `false`
     * @param value The value to look for
     * @param compare The method used to determine if two elements are equal
     */
    public contains(value: T, compare?: equality<T>): boolean {
        let comp = compare || ((left: T, right: T) => left === right);
        return this.any(item => !!comp(value, item));
    }

    /**
     * `Immediate Method` Calls `callback` for every single element in `this`. If `stop` is ever executed then the iteration will cease.
     * @param callback The action to perform on each element of `this`
     */
    public forEach(callback: ((value: T, index: number, stop: () => void) => any)) {
        let i = 0, stopped = false, stop = () => stopped = true;
        for (const value of this) {
            callback(value, i++, stop);
            if (stopped) break;
        }
    }

    /**
     * `Immediate Method` Returns the number of elements in `this` which match `predicate`. If `predicate` is not provided, return the total count.
     * @param predicate The predicate to use
     */
    public count(predicate?: predicate<T>): number { return filter(this, predicate).reduce(p => p + 1, 0); }
}

class ArrayEnumerable<T> extends Enumerable<T> {
    private readonly source: T[];
    constructor(source: T[]) {
        super(source);
        this.source = source;
    }

    public count(predicate?: predicate<T>) {
        if (!predicate) this.source.length;
        return super.count(predicate);
    }

    public last(predicate?: predicate<T>, defaultValue?: T) {
        if (!predicate) return this.source[this.source.length - 1];
        for (let i = this.source.length - 1; i >= 0; i--)
            if (predicate(this.source[i], i))
                return this.source[i];
        return defaultValue;
    }

    public get(position: number) {
        return this.source[position];
    }

    public join(separator?: string) {
        return this.source.join(separator);
    }

    public toArray() {
        return this.source;
    }

    public exhaust() {
        return this;
    }
}

class SetEnumerable<T> extends Enumerable<T> {
    private readonly source: Set<T>;
    constructor(source: Set<T>) {
        super(source);
        this.source = source;
    }

    public count(predicate?: predicate<T>) {
        if (!predicate) this.source.size;
        return super.count(predicate);
    }

    public distinct(comparer?: equality<T>): Enumerable<T> {
        if (!comparer) return this;
        return super.distinct(comparer);
    }

    public contains(value: T, compare?: equality<T>) {
        if (!compare) return this.source.has(value);
        return super.contains(value, compare);
    }

    public exhaust() {
        return this;
    }
}

/**
 * A wrapper class which contains a collection of elements and a key associated with those elements.
 */
class Group<T, K> extends ArrayEnumerable<T> {
    public readonly key: K;

    constructor(source: T[], key: K) {
        super(source);
        this.key = key;
    }
}

export class InvalidEnumerableSource extends Error {
    public readonly source: any;
    constructor(source: any) {
        super('Invalid enumerable source');
        this.source = source;
    }
}

const done: IteratorResult<any> = { value: undefined, done: true };
const doneIterator: Iterator<any> = { next() { return done; } };
const empty = new Enumerable(() => doneIterator);

function getIteratorFunc<T>(source: EnumerableSource<T>): (() => Iterator<T>) {
    if (typeof source === 'function')
        return source;
    if (typeof source === 'object')
        return source[Symbol.iterator].bind(source);
    throw new Error('Invalid enumerable source');
}

function map<T, R>(source: Enumerable<T>, mapping: mapping<T, R>): Enumerable<R> {
    return new Enumerable(function* () {
        let i = 0;
        for (const value of source)
            yield mapping(value, i++);
    });
}

function mapMany<T, R>(source: Enumerable<T>, mapping: mapping<T, Iterable<R>>): Enumerable<R> {
    return new Enumerable(function* () {
        for (const iterable of source.map(mapping))
            for (const value of iterable)
                yield value;
    });
}

function filter<T>(source: Enumerable<T>, predicate?: predicate<T>): Enumerable<T> {
    if (!predicate)
        return source;
    return new Enumerable(function* () {
        let i = 0;
        for (const value of source)
            if (predicate(value, i++))
                yield value;
    });
}

function skipWhile<T>(source: Enumerable<T>, predicate: predicate<T>): Enumerable<T> {
    return new Enumerable(function* () {
        let i = 0, skip = true;
        for (const value of source) {
            if (skip)
                skip = predicate(value, i++);
            if (!skip)
                yield value;
        }
    });
}

function takeWhile<T>(source: Enumerable<T>, predicate: predicate<T>): Enumerable<T> {
    return new Enumerable(function* () {
        let i = 0;
        for (const value of source) {
            if (!predicate(value, i++))
                break;
            yield value;
        }
    });
}

function distinct<T>(source: Enumerable<T>, comparer?: equality<T>): Enumerable<T> {
    let comp = comparer || ((left, right) => left === right);
    let search = (left: T, set: Enumerable<T>) => set.any(right => !comp(left, right));

    return new Enumerable(function* () {
        let values = source.exhaust();
        let i = 0;
        for (const value of values)
            if (!search(value, values.take(i++)))
                yield value;
    });
}

function sort<T, K>(source: Enumerable<T>, comparer?: comparer<K>, keyMap?: keySelector<T, K>, descending?: boolean): Enumerable<T> {
    let comp = comparer || ((l, r) => l == r ? 0 : l < r ? -1 : 1);
    let keyOf = <keySelector<T, K>>(keyMap || (v => v));
    let mult = (descending ? -1 : 1);

    let sorter = (left: T, right: T) => mult * comp(keyOf(left), keyOf(right));

    return new Enumerable(function* () {
        for (const value of source.toArray().sort(sorter))
            yield value;
    });
}

function reverse<T>(source: Enumerable<T>): Enumerable<T> {
    return new Enumerable(function* () {
        let values = source.toArray();
        for (let i = values.length; i > 0;)
            yield values[--i];
    });
}

function concat<T, R>(source: EnumerableSource<T>, ...sources: EnumerableSource<R>[]): Enumerable<T | R> {
    return new Enumerable(function* () {
        for (const value of Enumerable.from(source) as Enumerable<T>)
            yield value;
        for (const source of sources)
            for (const value of Enumerable.from(source) as Enumerable<R>)
                yield value;
    });
}

function except<T>(source: Enumerable<T>, except: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> {
    let comp = comparer || ((left, right) => left === right);

    return new Enumerable(function* () {
        let exclude = Enumerable.from(except).exhaust();

        for (const value of source)
            if (!exclude.contains(value, comp))
                yield value;
    });
}

function union<T>(source: Enumerable<T>, other: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> {
    return source.concat(other).distinct(comparer);
}

function intersect<T>(source: Enumerable<T>, other: EnumerableSource<T>, comparer?: equality<T>): Enumerable<T> {
    return new Enumerable(function* () {
        let intersect = Enumerable.from(other).exhaust();
        for (const value of source)
            if (intersect.contains(value, comparer))
                yield value;
    });
}