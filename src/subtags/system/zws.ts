import { ISubtagToken, errors } from '../../models';
import { BasicSubtag } from '../abstract/basicSubtag';

export class ZWSSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'zws',
            category: 'system',
            arguments: [],
            description: 'Will be replaced by `\u200b` (zero width space - unicode 200B) on execution.',
            examples: [
                { code: 'This is a zero width space! {zws}', output: 'This is a zero width space! \u200b' }
            ]
        });

        this.whenArgs('0', () => '\u200b')
            .default(errors.tooManyArgs);
    }

    public optimize(token: ISubtagToken): ISubtagToken | string {
        if (token.args.length === 0) {
            return '\u200b';
        }
        return token;
    }
}

export default new ZWSSubtag();