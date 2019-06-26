import { errors, ExecutionContext, IStringToken, Subtag, SubtagValue, StringExecutionResult as SER, ISubtagToken } from '../../models';
import boolSubtag from './bool';

export class IfSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'if',
            contextType: ExecutionContext
        });

        this.whenArgs('<=1', errors.notEnoughArgs)
            .whenArgs('2,3', this.runNoComp, [0]) // {if;RESOLVE;DEFER[;DEFER]}
            .whenArgs('4,5', this.runWithComp, [0, 1, 2]) // {if;RESOLVE;RESOLVE;RESOLVE;DEFER[;DEFER]}
            .default(errors.tooManyArgs);
    }

    public runNoComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: IStringToken[], [bool]: SER[]): Promise<SubtagValue> {
        const tryBool = bool.tryGetBoolean();
        if (otherwise === undefined) {
            otherwise = this.fakeArgument('');
        }

        if (!tryBool.success) {
            return Promise.resolve(errors.types.notBool(token.args[0]));
        } else if (tryBool.value) {
            return context.execute(then);
        } else {
            return context.execute(otherwise);
        }
    }

    public runWithComp(context: ExecutionContext, token: ISubtagToken, [then, otherwise]: IStringToken[], [left, comp, right]: SER[]): Promise<SubtagValue> {
        const boolResult = boolSubtag.check(context, left, comp, right);
        if (otherwise === undefined) {
            otherwise = this.fakeArgument('');
        }

        if (boolResult === undefined) {
            return Promise.resolve(errors.types.notOperator(token));
        } else if (boolResult === true) {
            return context.execute(then);
        } else {
            return context.execute(otherwise);
        }
    }
}

export default new IfSubtag();