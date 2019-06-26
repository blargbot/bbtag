import { Subtag, ExecutionContext, StringExecutionResult as SER, errors, SubtagValue, ISubtagToken, IStringToken } from '../../models';

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

    public run(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [val1, val2, val3]: SER[]): SubtagValue {
        return this.check(context, val1, val2, val3);
    }

    public check(context: ExecutionContext, val1: SER, val2: SER, val3: SER): boolean | undefined {
        let left: SER;
        let right: SER;
        let comparer: (left: SER, right: SER) => boolean;
        let key: string;

        if ((key = val2.getString()) in operators) {
            left = val1;
            right = val3;
        } else if ((key = val1.getString()) in operators) {
            left = val2;
            right = val3;
        } else if ((key = val3.getString()) in operators) {
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

const operators: { [key: string]: (left: SER, right: SER) => boolean } = {
};