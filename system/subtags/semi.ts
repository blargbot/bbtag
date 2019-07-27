import { bbtag, ISubtagToken } from '../..';
import { SystemSubtag } from '../subtag';

export class SemiSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'semi',
            category: 'system',
            arguments: [],
            description: 'Will be replaced by `;` on execution.',
            examples: [
                { code: 'This is a semicolon! {semi}', output: 'This is a semicolon! ;' }
            ]
        });

        this.whenArgs('0', () => ';')
            .default(bbtag.errors.tooManyArgs);
    }

    public optimize(token: ISubtagToken): ISubtagToken | string {
        if (token.args.length === 0) {
            return ';';
        }
        return token;
    }
}

export default new SemiSubtag();