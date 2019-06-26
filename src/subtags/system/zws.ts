import { ExecutionContext, ISubtagToken, Subtag, SubtagValue } from '../../models';

export class ZWSSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'zws',
            contextType: ExecutionContext
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