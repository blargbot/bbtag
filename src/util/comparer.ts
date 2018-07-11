import { deserialize } from './array';
import { number } from './regex';

type SOrN = string | number;
type compFunc = (a: SOrN, b: SOrN) => number;

// Number < NaN < symbols/letters

export class Comparer {
    public static Default: Comparer = new Comparer();

    private readonly _comparer: compFunc;

    constructor(internalComparer?: compFunc) {
        this._comparer = internalComparer || Comparer.defaultComparisonFunction;
    }

    public areEqual(a: SOrN, b: SOrN): boolean { return this.compare(a, b) === 0; }
    public notEqual(a: SOrN, b: SOrN): boolean { return this.compare(a, b) !== 0; }
    public greaterThan(a: SOrN, b: SOrN): boolean { return this.compare(a, b) > 0; }
    public greaterOrEqual(a: SOrN, b: SOrN): boolean { return this.compare(a, b) >= 0; }
    public lessThan(a: SOrN, b: SOrN): boolean { return this.compare(a, b) < 0; }
    public lessOrEqual(a: SOrN, b: SOrN): boolean { return this.compare(a, b) <= 0; }

    public startsWith(a: SOrN, b: SOrN): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.length > 0 && this.areEqual(asArray.v[0], b);
            }
        }
        return a.toString().startsWith(b.toString());
    }

    public endsWith(a: SOrN, b: SOrN): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.length > 0 && this.areEqual(asArray.v.pop()!, b);
            }
        }
        return a.toString().endsWith(b.toString());
    }

    public includes(a: SOrN, b: SOrN): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.find(entry => this.areEqual(entry, b)) !== undefined;
            }
        }
        return a.toString().includes(b.toString());
    }

    public sort(array: SOrN[]) {

    }

    public compare(a: SOrN, b: SOrN): number {
        let blocks = {
            a: this.toBlocks(a.toString()),
            b: this.toBlocks(b.toString())
        };

        let max = Math.max(blocks.a.length, blocks.b.length);
        for (let i = 0; i < max; i++) {
            switch (this._comparer(blocks.a[i], blocks.b[i])) {
                case -1: return -1;
                case 1: return 1;
            }
        }
        return 0;
    }

    private toBlocks(text: string): Array<string | number> {
        let regex = number();
        let numbers = text.match(regex) || [];
        let words = text.split(regex);

        let result = [];
        for (let i = 0; i < words.length; i++) {
            result.push(words[i]);
            if (/^\-Infinity$/.test(numbers[i]))
                result.push(Number.NEGATIVE_INFINITY);
            else if (/^\+?Infinity$/.test(numbers[i]))
                result.push(Number.POSITIVE_INFINITY);
            else
                result.push(parseFloat(numbers[i]));
        }

        result.pop();
        let first = result[0];
        let last = result[result.length - 1];
        if (typeof first === 'string' && first.length === 0)
            result.shift();
        if (typeof last === 'string' && last.length === 0)
            result.pop();

        return result;
    }

    public static defaultComparisonFunction(x: SOrN, y: SOrN) {
        if (typeof x === 'number' && typeof y === 'number') {
            let diff = x - y;
            if (diff < 0) return -1;
            if (diff > 0) return 1;
            if (diff === 0 || (isNaN(x) && isNaN(y)))
                return 0;
            if (isNaN(x)) return 1;
            if (isNaN(y)) return -1;
            return 0;
        }
        if (typeof x === 'number') {
            return -1;
        }
        if (typeof y === 'number') {
            return 1;
        }
        return x.localeCompare(y);
    }
}