import { ExecutionContext, Subtag, SubtagToken } from '../../models';

export class CommentSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'comment',
            aliases: ['//'],
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<any> {
        throw new Error('This method should never be called');
    }

    public optimize(): SubtagToken | string {
        return '';
    }
}

export default new CommentSubtag();