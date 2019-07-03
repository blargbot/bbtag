import { ISubtagToken, errors } from '../../structures';
import { BasicSubtag } from '../abstract/basicSubtag';

export class RBSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'rb',
            category: 'system',
            arguments: [],
            description: 'Will be replaced by `}` on execution.',
            examples: [
                { code: 'This is a bracket! {rb}', output: 'This is a bracket! }' }
            ]
        });

        this.whenArgs('0', () => '}')
            .default(errors.tooManyArgs);
    }

    public optimize(token: ISubtagToken): ISubtagToken | string {
        if (token.args.length === 0) {
            return '}';
        }
        return token;
    }
}

export default new RBSubtag();