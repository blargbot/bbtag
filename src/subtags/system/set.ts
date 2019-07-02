import { ExecutionContext, errors, args, SubtagResult, ISubtagToken, IStringToken, variableScopes } from '../../models';
import { BasicSubtag } from '../abstract/basicSubtag';
import util from '../../util';

export class SetSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'set',
            category: 'system',
            arguments: [args.r('name'), args.r('values', true)],
            description: 'Stores `value` under `name`. These variables are saved between sessions. ' +
                'You can use a character prefix to determine the scope of your variable.\n' +
                'Valid scopes are: ' + variableScopes.select(s => '`' + (s.prefix || 'none') + '` (' + s.name + ')').join(', ') +
                '.\nFor performance reasons, variables are not immediately stored to the database. See `{commit}` and `{rollback}`' +
                'for more information.',
            examples: [
                {
                    code: '{set;var1;This is local var1}\n' +
                        '{set;~var2;This is temporary var2}\n' +
                        '{set;var3;this;is;an;array}\n' +
                        '{get;var1}\n' +
                        '{get;~var2}\n' +
                        '{get;var3}',
                    output: 'This is local var1\n' +
                        'This is temporary var2\n' +
                        '{"v":["this","is","an","array"],"n":"var3"}'
                }
            ],
            arraySupport: true
        });

        this.whenArgs('0', errors.notEnoughArgs)
            .whenArgs('1', this.clearKey, true)
            .default(this.setKey, true);
    }

    public async clearKey(context: ExecutionContext, token: ISubtagToken, []: readonly IStringToken[], [key]: readonly SubtagResult[]): Promise<void> {
        await context.variables.delete(util.subtag.toString(key));
    }

    public async setKey(context: ExecutionContext, token: ISubtagToken, []: readonly IStringToken[], [key, ...values]: readonly SubtagResult[]): Promise<void> {
        await context.variables.set(util.subtag.toString(key), values.map(util.subtag.toPrimative));
    }
}

export default new SetSubtag();