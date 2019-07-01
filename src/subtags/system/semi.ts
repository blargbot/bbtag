import { ExecutionContext, ISubtagToken, Subtag } from '../../models';

export class SemiSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'semi',
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
        return ';';
    }
}

export default new SemiSubtag();