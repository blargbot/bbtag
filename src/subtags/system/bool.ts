import { Subtag, ExecutionContext, errors, SubtagResult, ISubtagToken, IStringToken } from '../../models';
import { default as util } from '../../util';

export class BoolSubtag extends Subtag<ExecutionContext> {
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

        if ((key = util.subtag.toString(val2)) in operators) {
            left = val1;
            right = val3;
        } else if ((key = util.subtag.toString(val1)) in operators) {
            left = val2;
            right = val3;
        } else if ((key = util.subtag.toString(val3)) in operators) {
            left = val1;
            right = val2;
        } else {
            return undefined;
        }

        comparer = operators[key];
        return comparer(left, right);
    }
}

export default new BoolSubtag();

const operators: { [key: string]: (left: SubtagResult, right: SubtagResult) => boolean } = {
};