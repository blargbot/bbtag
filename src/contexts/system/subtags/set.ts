import { bbtag } from '../../../language';
import { argumentBuilder as A, ArgumentCollection, validation } from '../../../structures';
import { Awaitable } from '../../../util';
import { SystemSubtag } from '../subtag';
import { variableScopes } from '../variableScopes';

export class SetSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'set',
            category: 'system',
            arguments: [A.r('name'), A.r('values', true)],
            description: 'Stores `value` under `name`. These variables are saved between sessions. ' +
                'You can use a character prefix to determine the scope of your variable.\n' +
                'Valid scopes are: ' + variableScopes.map(s => '`' + (s.prefix || 'none') + '` (' + s.name + ')').join(', ') +
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

        this.whenArgs('0', validation.notEnoughArgs)
            .whenArgs('1', this.clearKey, true)
            .default(this.setKey, true);
    }

    public clearKey(args: ArgumentCollection): Awaitable<void> {
        const key = args.get(0);
        return args.context.variables.delete(bbtag.toString(key));
    }

    public setKey(args: ArgumentCollection): Awaitable<void> {
        const [key, ...values] = args.getAll();
        return args.context.variables.set(bbtag.toString(key), values.map(bbtag.toPrimitive));
    }
}

export default new SetSubtag();