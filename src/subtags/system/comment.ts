import { args } from '../../models';
import { BasicSubtag } from '../abstract/basicSubtag';

export class CommentSubtag extends BasicSubtag {
    public constructor() {
        super({
            name: 'comment',
            aliases: ['//'],
            category: 'system',
            arguments: [args.o('text', true)],
            description: 'A subtag that just gets removed. Useful for documenting your code.',
            examples: [
                { code: '{//;this is a comment!', output: '' }
            ]
        });

        this.default(_ => { });
    }

    public optimize(): string {
        return '';
    }
}

export default new CommentSubtag();