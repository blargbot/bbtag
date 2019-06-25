import { ExecutionContext, Subtag, SubtagToken } from '../../models';

export class LBSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'lb',
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<any> {
        throw new Error('This method should never be called');
    }

    public optimize(): SubtagToken | string {
        return '{';
    }
}

export default new LBSubtag();