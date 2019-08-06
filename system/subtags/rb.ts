import { ISubtagToken } from '../../lib';
import { SystemSubtag } from '../subtag';

export class RBSubtag extends SystemSubtag {
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
            .default(this.bbtag.errors.tooManyArgs);
    }

    public optimize(token: ISubtagToken): ISubtagToken | string {
        if (token.args.length === 0) {
            return '}';
        }
        return token;
    }
}

export default new RBSubtag();