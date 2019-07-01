import { ExecutionContext, ISubtagToken, Subtag } from '../../models';

export class ZWSSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'zws',
            contextType: ExecutionContext,
            arguments: [],
            category: 'system',
            description: ''
        });
    }

    public execute(): never {
        throw new Error('This method should never be called');
    }

    public optimize(): ISubtagToken | string {
        return '\u200B';
    }
}

export default new ZWSSubtag();