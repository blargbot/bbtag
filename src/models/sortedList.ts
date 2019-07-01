import { IterableEnumerable } from '../util/enumerable/adapters';

export class SortedList<T> extends IterableEnumerable<T> {
    private readonly _baseValue: T[];
    private readonly _keySelector: (item: T) => any;
    private readonly _ascending: boolean;

    public constructor()
    public constructor(keySelector: (item: T) => any)
    public constructor(ascending: boolean)
    public constructor(keySelector: (item: T) => any, ascending: boolean)
    public constructor(arg1?: boolean | ((item: T) => any), arg2?: boolean) {
        if (typeof arg1 === 'boolean') {
            arg2 = arg1;
            arg1 = undefined;
        } else if (arg1 === undefined) {
            arg1 = (k: any) => k;
            arg2 = true;
        }

        const base: T[] = [];
        super(base);
        this._baseValue = base;
        this._keySelector = arg1 || (k => k);
        this._ascending = arg2!;
        this.toArray = () => base;
    }

    public add(...items: T[]): void {
        nextItem:
        for (const item of items) {
            const itemKey = this._keySelector(item);
            for (let i = 0; i < this._baseValue.length; i++) {
                const elementKey = this._keySelector(this._baseValue[i]);
                if (this._ascending ? elementKey >= itemKey : elementKey <= itemKey) {
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
            this._baseValue.push(item);
        }
    }
}