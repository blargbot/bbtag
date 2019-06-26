import { ExecutionContext, ISubtagToken, Subtag, SubtagValue } from '../../models';

export class RBSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'rb',
            contextType: ExecutionContext
        });
    }

    public execute(): never {
        throw new Error('This method should never be called');
    }

    public optimize(): ISubtagToken | string {
        return '}';
    }
}

export default new RBSubtag();