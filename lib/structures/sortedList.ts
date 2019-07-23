import { IterableEnumerable } from '../util';

type SortedListKey = string | number | boolean;

export class SortedList<T> extends IterableEnumerable<T> {
    private readonly _baseValue: T[];
    private readonly _keySelector: (item: T) => SortedListKey;
    private readonly _descending: boolean;

    public constructor(keySelector: (item: T) => SortedListKey, descending: boolean = false) {
        const base: T[] = [];
        super(base);
        this._baseValue = base;
        this._keySelector = keySelector;
        this._descending = descending;
        this.toArray = () => base;
    }

    public add(...items: T[]): void {
        nextItem:
        for (const item of items) {
            const itemKey = this._keySelector(item);
            for (let i = 0; i < this._baseValue.length; i++) {
                const elementKey = this._keySelector(this._baseValue[i]);
                if (this._descending ? elementKey <= itemKey : elementKey >= itemKey) {
                    this._baseValue.splice(i, 0, item);
                    continue nextItem;
                }
            }
            this._baseValue.push(item);
        }
    }

    public delete(...items: T[]): void {
        nextItem:
        for (const item of items) {
            for (let i = 0; i < this._baseValue.length; i++) {
                if (this._baseValue[i] === item) {
                    this._baseValue.splice(i, 1);
                    continue nextItem;
                }
            }
        }
    }

    public clear(): void {
        this._baseValue.splice(0, this._baseValue.length);
    }
}