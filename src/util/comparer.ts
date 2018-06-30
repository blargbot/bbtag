import { deserialize } from './array';
import { number } from './regex';

type compFunc = (a: string, b: string) => number;
type sorn = string | number;

export class Comparer {
    public static Default: Comparer = new Comparer();

    private readonly _comparer: compFunc;

    constructor(internalComparer?: compFunc) {
        if (internalComparer === undefined) {
            let collator = new Intl.Collator();
            internalComparer = collator.compare.bind(collator) as compFunc;
        }
        this._comparer = internalComparer;
    }

    public areEqual(a: sorn, b: sorn): boolean { return this.compare(a, b) === 0; }
    public areNotEqual(a: sorn, b: sorn): boolean { return this.compare(a, b) !== 0; }
    public greaterThan(a: sorn, b: sorn): boolean { return this.compare(a, b) > 0; }
    public greaterOrEqual(a: sorn, b: sorn): boolean { return this.compare(a, b) >= 0; }
    public lessThan(a: sorn, b: sorn): boolean { return this.compare(a, b) < 0; }
    public lessOrEqual(a: sorn, b: sorn): boolean { return this.compare(a, b) <= 0; }

    public startsWith(a: sorn, b: sorn): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.length > 0 && this.areEqual(asArray.v[0], b);
            }
        }
        return a.toString().startsWith(b.toString());
    }

    public endsWith(a: sorn, b: sorn): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.length > 0 && this.areEqual(asArray.v.pop()!, b);
            }
        }
        return a.toString().endsWith(b.toString());
    }

    public includes(a: sorn, b: sorn): boolean {
        if (typeof a !== 'number') {
            let asArray = deserialize(a);
            if (asArray !== undefined) {
                return asArray.v.find(entry => this.areEqual(entry, b)) !== undefined;
            }
        }
        return a.toString().includes(b.toString());
    }

    public sort(array: sorn[]) {

    }

    public compare(a: sorn, b: sorn): number {
        let blocks = {
            a: this.toBlocks(a.toString()),
            b: this.toBlocks(b.toString())
        };

        let max = Math.max(blocks.a.length, blocks.b.length);
        for (let i = 0; i < max; i++) {
            switch (this._comparer(blocks.a[i].toString(), blocks.b[i].toString())) {
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
}