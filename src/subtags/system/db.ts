import { Subtag, ExecutionContext, SubtagToken } from '../../models';

export class GetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }

    public execute(subtag: SubtagToken, context: ExecutionContext): string {
        throw new Error('Not implemented');
    }
}

export class SetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }

    public execute(subtag: SubtagToken, context: ExecutionContext): void {
        throw new Error('Not implemented');
    }
}

export default [new GetSubtag(), new SetSubtag()];