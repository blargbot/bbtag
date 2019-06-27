import { Subtag, ExecutionContext, errors, SubtagResult, ISubtagToken, IStringToken } from '../../models';
import { default as util } from '../../util';

type operator = (left: SubtagResult, right: SubtagResult) => boolean;

export class BoolSubtag extends Subtag<ExecutionContext> {
    public static readonly operators: { readonly [key: string]: operator } = {
        '==': (l, r) => util.subtag.compare(l, r) === 0,
        '!=': (l, r) => util.subtag.compare(l, r) !== 0,
        '>=': (l, r) => util.subtag.compare(l, r) >= 0,
        '>': (l, r) => util.subtag.compare(l, r) > 0,
        '<=': (l, r) => util.subtag.compare(l, r) <= 0,
        '<': (l, r) => util.subtag.compare(l, r) < 0,
        'startswith': (l, r) => util.subtag.toCollection(l).startsWith(r),
        'endswith': (l, r) => util.subtag.toCollection(l).endsWith(r),
        'includes': (l, r) => util.subtag.toCollection(l).includes(r)
    };

    public constructor() {
        super({
            name: 'bool',
            contextType: ExecutionContext
        });

        this.whenArgs('<=2', errors.notEnoughArgs)
            .whenArgs('3', this.run, [0, 1, 2]) // {bool;RESOLVE;RESOLVE;RESOLVE}
            .default(errors.tooManyArgs);
    }

    public run(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [val1, val2, val3]: SubtagResult[]): SubtagResult {
        return this.check(context, val1, val2, val3);
    }

    public check(context: ExecutionContext, val1: SubtagResult, val2: SubtagResult, val3: SubtagResult): boolean | undefined {
        let left: SubtagResult;
        let right: SubtagResult;
        let comparer: (left: SubtagResult, right: SubtagResult) => boolean;
        let key: string;

        if ((key = util.subtag.toString(val2)) in BoolSubtag.operators) {
            left = val1;
            right = val3;
        } else if ((key = util.subtag.toString(val1)) in BoolSubtag.operators) {
            left = val2;
            right = val3;
        } else if ((key = util.subtag.toString(val3)) in BoolSubtag.operators) {
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