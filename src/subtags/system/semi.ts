import { Subtag, ExecutionContext, SubtagToken } from '../../models';

export class SemiSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'semi',
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<any> {
        throw new Error("This method should never be called");
    }

    public optimize(): SubtagToken | string {
        return ';';
    }
}

export default new SemiSubtag();