import { Subtag, ExecutionContext, SubtagToken } from '../../models';

export class RBSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'rb',
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<any> {
        throw new Error("This method should never be called");
    }

    public optimize(): SubtagToken | string {
        return '}';
    }
}

export default new RBSubtag();