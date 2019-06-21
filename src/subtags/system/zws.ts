import { Subtag, ExecutionContext, SubtagToken } from '../../models';

export class ZWSSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'zws',
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<any> {
        throw new Error("This method should never be called");
    }

    public optimize(): SubtagToken | string {
        return '\u200B';
    }
}

export default new ZWSSubtag();