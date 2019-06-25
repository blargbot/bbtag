import { ExecutionContext, ISubtagExecutionResult, ISubtagToken, Subtag } from '../../models';

export class GetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }

    public async execute(subtag: ISubtagToken, context: ExecutionContext): Promise<ISubtagExecutionResult> {
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

    public async execute(subtag: ISubtagToken, context: ExecutionContext): Promise<ISubtagExecutionResult> {
        throw new Error('Not implemented');
    }
}

export default [new GetSubtag(), new SetSubtag()];