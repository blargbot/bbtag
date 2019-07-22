import { bbtag, SubtagResult } from '../../../language';
import { argumentBuilder as A, ArgumentCollection, validation } from '../../../structures';
import { Awaitable } from '../../../util';
import { SystemSubtag } from '../subtag';
import { BoolSubtag, default as bool } from './bool';

export class IfSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'if',
            category: 'system',
            arguments: [
                A.r('value1'),
                A.g(A.r('evaluator'), A.require('value2')),
                A.r('then'),
                A.o('else')
            ],
            description:
                'If `evaluator` and `value2` are provided, `value1` is evaluated against `value2` using `evaluator`. ' +
                'If they are not provided, `value1` is read as `true` or `false`. ' +
                'If the resulting value is `true` then the tag returns `then`, otherwise it returns `else`.\n' +
                'Valid evaluators are `' + Object.keys(BoolSubtag.operators).join('`, `') + '`.',
            examples: [
                { code: '{if;5;<=;10;5 is less than or equal to 10;5 is greater than 10}.', output: '5 is less than or equal to 10.' }
            ]
        });

        this.whenArgs('<=1', validation.notEnoughArgs)
            .whenArgs('2,3', this.runNoComp, [0]) // {if;RESOLVE;DEFER[;DEFER]}
            .whenArgs('4,5', this.runWithComp, [0, 1, 2]) // {if;RESOLVE;RESOLVE;RESOLVE;DEFER[;DEFER]}
            .default(validation.tooManyArgs);
    }

    public runNoComp(args: ArgumentCollection): Awaitable<SubtagResult> {
        const success = args.get(0);
        const tryBool = bbtag.tryToBoolean(success);

        if (!tryBool.success) {
            return validation.types.notBool(args, args.token.args[0]);
        } else if (tryBool.value) {
            return args.execute(1);
        } else {
            return args.execute(2);
        }
    }

    public runWithComp(args: ArgumentCollection): Awaitable<SubtagResult> {
        const [left, comp, right] = args.get(0, 1, 2);
        const success = bool.check(left, comp, right);

        if (success === undefined) {
            return validation.types.notOperator(args);
        } else if (success === true) {
            return args.execute(3);
        } else {
            return args.execute(4);
        }
    }
}

export default new IfSubtag();