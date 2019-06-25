import { ExecutionContext, ISubtagToken, Subtag } from '../../models';

export class GetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }

    public execute(subtag: ISubtagToken, context: ExecutionContext): string {
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

    public execute(subtag: ISubtagToken, context: ExecutionContext): void {
        throw new Error('Not implemented');
    }
}

export default [new GetSubtag(), new SetSubtag()];