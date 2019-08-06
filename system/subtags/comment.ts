import { SystemSubtag } from '../subtag';

export class CommentSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'comment',
            aliases: ['//'],
            category: 'system',
            arguments: a => [a.o('text', true)],
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