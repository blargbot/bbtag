import { SystemSubtag } from '..';
import { argumentBuilder as A, ArgumentCollection, Awaitable, bbtag, validation } from '../..';

export class SetSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'set',
            category: 'system',
            arguments: [A.r('name'), A.r('values', true)],
            description: ctx =>
                'Stores `value` under `name`. These variables are saved between sessions. ' +
                'You can use a character prefix to determine the scope of your variable.\n' +
                'Valid scopes are: ' + ctx.engine.variableScopes.select(s => s.prefix ? `\`${s.prefix}\`` : 'none').joinString(',') +
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
        return args.context.variables.delete(bbtag.convert.toString(key));
    }

    public setKey(args: ArgumentCollection): Awaitable<void> {
        const [key, ...values] = args.getAll();
        return args.context.variables.set(bbtag.convert.toString(key), values.map(bbtag.convert.toPrimitive));
    }
}

export default new SetSubtag();