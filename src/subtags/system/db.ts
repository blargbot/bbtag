import { ExecutionContext, Subtag } from '../../models';

export class GetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'get',
            contextType: ExecutionContext
        });
    }
}

export class SetSubtag extends Subtag<ExecutionContext> {
    public constructor() {
        super({
            name: 'set',
            contextType: ExecutionContext
        });
    }
}

export default [new GetSubtag(), new SetSubtag()];