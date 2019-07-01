import { ExecutionContext, Subtag, ISubtagArguments } from '../../models';

export abstract class BasicSubtag extends Subtag<ExecutionContext> {
    protected constructor(args: Omit<ISubtagArguments<ExecutionContext>, 'contextType'>) {
        super({
            ...args,
            contextType: ExecutionContext
        });
    }
}