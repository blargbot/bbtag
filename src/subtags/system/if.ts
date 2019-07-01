import { errors, ExecutionContext, IStringToken, Subtag, SubtagResult, ISubtagToken } from '../../models';
import { default as boolSubtag } from './bool';
import { default as util } from '../../util';

export class IfSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'if',
            contextType: ExecutionContext,
            arguments: [],
            category: 'system',
            description: ''
        });

        this.whenArgs('<=1', errors.notEnoughArgs)
            .whenArgs('2,3', this.runNoComp, [0]) // {if;RESOLVE;DEFER[;DEFER]}
            .whenArgs('4,5', this.runWithComp, [0, 1, 2]) // {if;RESOLVE;RESOLVE;RESOLVE;DEFER[;DEFER]}
            .default(errors.tooManyArgs);
    }

    public runNoComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: IStringToken[], [bool]: SubtagResult[]): Promise<SubtagResult> {
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

    public runWithComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: IStringToken[], [left, comp, right]: SubtagResult[]): Promise<SubtagResult> {
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