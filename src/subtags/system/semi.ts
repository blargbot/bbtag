import { ExecutionContext, ISubtagToken, Subtag, SubtagValue } from '../../models';

export class SemiSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'semi',
            contextType: ExecutionContext
        });
    }

    public execute(): Promise<SubtagValue> {
        throw new Error('This method should never be called');
    }

    public optimize(): ISubtagToken | string {
        return ';';
    }
}

export default new SemiSubtag();