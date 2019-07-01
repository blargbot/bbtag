import { ExecutionContext, errors, args, SubtagResult, ISubtagToken, IStringToken } from '../../models';
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
                'Valid scopes are: ' + util.variables.map(s => '`' + (s.prefix || 'none') + '` (' + s.name + ')').join(', ') +
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

    public async clearKey(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [key]: SubtagResult[]): Promise<void> {
        await context.variables.remove(util.subtag.toString(key));
    }

    public async setKey(context: ExecutionContext, token: ISubtagToken, []: IStringToken[], [key, ...values]: SubtagResult[]): Promise<void> {
        await context.variables.set(util.subtag.toString(key), ...values);
    }
}

export default new SetSubtag();