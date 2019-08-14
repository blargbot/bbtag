import { ArgumentCollection, Awaitable, bbUtil, SubtagResult } from '../../lib';
import { SystemSubtag } from '../subtag';
import { BoolSubtag } from './bool';

export class IfSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'if',
            category: 'system',
            arguments: a => [
                a.r('value1'),
                a.g(a.r('evaluator'), a.require('value2')),
                a.r('then'),
                a.o('else')
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

        this.whenArgs('<=1', bbUtil.errors.notEnoughArgs)
            .whenArgs('2,3', this.runNoComp, [0]) // {if;RESOLVE;DEFER[;DEFER]}
            .whenArgs('4,5', this.runWithComp, [0, 1, 2]) // {if;RESOLVE;RESOLVE;RESOLVE;DEFER[;DEFER]}
            .default(bbUtil.errors.tooManyArgs);
    }

    public runNoComp(args: ArgumentCollection): Awaitable<SubtagResult> {
        const success = args.get(0);
        const tryBool = bbUtil.convert.tryToBoolean(success);

        if (!tryBool.success) {
            return bbUtil.errors.types.notBool(args, args.token.args[0]);
        } else if (tryBool.value) {
            return args.execute(1);
        } else {
            return args.execute(2);
        }
    }

    public runWithComp(args: ArgumentCollection): Awaitable<SubtagResult> {
        const bool = args.context.subtags.find('bool', BoolSubtag)
            || bbUtil.errors.throw.system.unknownSubtag(args, 'bool');
        const [left, comp, right] = args.get(0, 1, 2);
        const success = bool.check(left, comp, right);

        if (success === undefined) {
            return bbUtil.errors.types.notOperator(args);
        } else if (success === true) {
            return args.execute(3);
        } else {
            return args.execute(4);
        }
    }
}

export default new IfSubtag();