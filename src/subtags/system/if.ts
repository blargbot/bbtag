import { errors, ExecutionContext, IStringToken, SubtagResult, ISubtagToken, args } from '../../models';
import { default as boolSubtag, BoolSubtag } from './bool';
import { default as util } from '../../util';
import { BasicSubtag } from '../abstract/basicSubtag';

export class IfSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'if',
            category: 'system',
            arguments: [
                args.r('value1'),
                args.g(args.r('evaluator'), args.require('value2')),
                args.r('then'),
                args.o('else')
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

        this.whenArgs('<=1', errors.notEnoughArgs)
            .whenArgs('2,3', this.runNoComp, [0]) // {if;RESOLVE;DEFER[;DEFER]}
            .whenArgs('4,5', this.runWithComp, [0, 1, 2]) // {if;RESOLVE;RESOLVE;RESOLVE;DEFER[;DEFER]}
            .default(errors.tooManyArgs);
    }

    public runNoComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: readonly IStringToken[], [bool]: readonly SubtagResult[]): Promise<SubtagResult> {
        const tryBool = util.subtag.tryToBoolean(bool);
        if (otherwise === undefined) {
            otherwise = this.fakeArgument('');
        }

        if (!tryBool.success) {
            return Promise.resolve(errors.types.notBool(context, token.args[0]));
        } else if (tryBool.value) {
            return context.execute(then);
        } else {
            return context.execute(otherwise);
        }
    }

    public runWithComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: readonly IStringToken[], [left, comp, right]: readonly SubtagResult[]):
        Promise<SubtagResult> {
        const boolResult = boolSubtag.check(context, left, comp, right);
        if (otherwise === undefined) {
            otherwise = this.fakeArgument('');
        }

        if (boolResult === undefined) {
            return Promise.resolve(errors.types.notOperator(context, token));
        } else if (boolResult === true) {
            return context.execute(then);
        } else {
            return context.execute(otherwise);
        }
    }
}

export default new IfSubtag();