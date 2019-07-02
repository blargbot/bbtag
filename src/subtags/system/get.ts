import { args, errors, ExecutionContext, ISubtagToken, IStringToken, SubtagResult, variableScopes } from '../../models';
import { BasicSubtag } from '../abstract/basicSubtag';
import util from '../../util';

export class GetSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'get',
            category: 'system',
            arguments: [args.r('name'), args.o('index')],
            description:
                'Returns the stored variable `varName`, or an index within it if it is a stored array. ' +
                'You can use a character prefix to determine the scope of your variable.\n' +
                'Valid scopes are: ' + variableScopes.select(s => '`' + (s.prefix || 'none') + '` (' + s.name + ')').join(', ') + '.',
            examples: [
                {
                    code:
                        '{set;var1;This is local var1}\n' +
                        '{set;~var2;This is temporary var2}\n' +
                        '{set;var3;this;is;an;array}\n' +
                        '{get;var1}\n' +
                        '{get;~var2}\n' +
                        '{get;var3}',
                    output:
                        'This is local var1\n' +
                        'This is temporary var2\n' +
                        '{"v":["this","is","an","array"],"n":"var3"}'
                }
            ]
        });

        this.whenArgs('0', errors.notEnoughArgs)
            .whenArgs('1', this.getKey)
            .whenArgs('2', this.getIndex)
            .default(errors.tooManyArgs);
    }

    public async getKey(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [key]: SubtagResult[]): Promise<SubtagResult> {
        await context.variables.get(util.subtag.toString(key));
    }

    public async getIndex(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [key, index]: SubtagResult[]): Promise<SubtagResult> {
        const value = await context.variables.get(util.subtag.toString(key));
        const asArray = util.subtag.tryToArray(value);
        const indexAsNumber = util.subtag.tryToNumber(index);

        if (!asArray.success) {
            return value;
        } else if (!indexAsNumber.success) {
            return errors.types.notNumber(context, token.args[1]);
        } else if (asArray.value.length <= indexAsNumber.value) {
            return errors.types.array.outOfRange(context, token);
        }

        return asArray.value[indexAsNumber.value];
    }
}

export default new GetSubtag();