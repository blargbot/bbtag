import { ExecutionContext, ISubtagToken, Subtag } from '../../models';

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

    public optimize(): ISubtagToken | string {
        return '{';
    }
}

export default new LBSubtag();