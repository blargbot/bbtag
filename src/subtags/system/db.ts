import { ExecutionContext, ISubtagToken, Subtag, SubtagValue } from '../../models';

export class GetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }

    public async execute(subtag: ISubtagToken, context: ExecutionContext): Promise<SubtagValue> {
        throw new Error('Not implemented');
    }
}

export class SetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'set',
            contextType: ExecutionContext
        });
    }

    public async execute(subtag: ISubtagToken, context: ExecutionContext): Promise<SubtagValue> {
        throw new Error('Not implemented');
    }
}

export default [new GetSubtag(), new SetSubtag()];