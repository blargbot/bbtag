import { SystemSubtag } from '..';
import { argumentBuilder as A, ArgumentCollection, Awaitable, bbtag, SubtagResult, validation } from '../..';

export class GetSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'get',
            category: 'system',
            arguments: [A.r('name'), A.o('index')],
            description: ctx =>
                'Returns the stored variable `varName`, or an index within it if it is a stored array. ' +
                'You can use a character prefix to determine the scope of your variable.\n' +
                'Valid scopes are: ' + ctx.engine.variableScopes.select(s => s.prefix ? `\`${s.prefix}\`` : 'none').join(',') + '.',
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

        this.whenArgs('0', validation.notEnoughArgs)
            .whenArgs('1', this.getKey, true)
            .whenArgs('2', this.getIndex, true)
            .default(validation.tooManyArgs);
    }

    public getKey(args: ArgumentCollection): Awaitable<SubtagResult> {
        const key = args.get(0);
        return args.context.variables.get(bbtag.toString(key));
    }

    public async getIndex(args: ArgumentCollection): Promise<SubtagResult> {
        const [key, index] = args.get(0, 1);
        const value = await args.context.variables.get(bbtag.toString(key));
        const asArray = bbtag.tryToArray(value);
        const indexAsNumber = bbtag.tryToNumber(index);

        if (!asArray.success) {
            return value;
        } else if (!indexAsNumber.success) {
            return validation.types.notNumber(args, args.token.args[1]);
        } else if (asArray.value.length <= indexAsNumber.value) {
            return validation.types.array.outOfRange(args, args.token);
        }

        return asArray.value[indexAsNumber.value];
    }
}

export default new GetSubtag();