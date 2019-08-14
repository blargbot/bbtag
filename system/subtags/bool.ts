import { ArgumentCollection, bbtag, SubtagResult } from '../../lib';
import { SystemSubtag } from '../subtag';

type operator = (left: SubtagResult, right: SubtagResult) => boolean;

export class BoolSubtag extends SystemSubtag {
    public static readonly operators: { readonly [key: string]: operator } = {
        '==': (l, r) => bbtag.compare(l, r) === 0,
        '!=': (l, r) => bbtag.compare(l, r) !== 0,
        '>=': (l, r) => bbtag.compare(l, r) >= 0,
        '>': (l, r) => bbtag.compare(l, r) > 0,
        '<=': (l, r) => bbtag.compare(l, r) <= 0,
        '<': (l, r) => bbtag.compare(l, r) < 0,
        'startswith': (l, r) => bbtag.convert.toCollection(l).startsWith(r),
        'endswith': (l, r) => bbtag.convert.toCollection(l).endsWith(r),
        'includes': (l, r) => bbtag.convert.toCollection(l).includes(r)
    };

    public constructor() {
        super({
            name: 'bool',
            category: 'system',
            arguments: a => [a.r('evaluator'), a.r('arg1'), a.r('arg2')],
            description:
                'Evaluates `arg1` and `arg2` using the `evaluator` and returns `true` or `false`. ' +
                'Valid evaluators are `' + Object.keys(BoolSubtag.operators).join('`, `') + '`\n' +
                'The positions of `evaluator` and `arg1` can be swapped.',
            examples: [
                { code: '{bool;<=;5;10}', output: 'true' }
            ]
        });

        this.whenArgs('<=2', bbtag.errors.notEnoughArgs)
            .whenArgs('3', this.run, true) // {bool;RESOLVE;RESOLVE;RESOLVE}
            .default(bbtag.errors.tooManyArgs);
    }

    public run(args: ArgumentCollection): SubtagResult {
        const [val1, val2, val3] = args.get(0, 1, 2);
        return this.check(val1, val2, val3);
    }

    public check(val1: SubtagResult, val2: SubtagResult, val3: SubtagResult): boolean | undefined {
        let left: SubtagResult;
        let right: SubtagResult;
        let comparer: operator;
        let key: string;

        if ((key = bbtag.convert.toString(val2)) in BoolSubtag.operators) {
            left = val1;
            right = val3;
        } else if ((key = bbtag.convert.toString(val1)) in BoolSubtag.operators) {
            left = val2;
            right = val3;
        } else if ((key = bbtag.convert.toString(val3)) in BoolSubtag.operators) {
            left = val1;
            right = val2;
        } else {
            return undefined;
        }

        comparer = BoolSubtag.operators[key];
        return comparer(left, right);
    }
}

export default new BoolSubtag();