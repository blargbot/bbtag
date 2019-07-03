import { ExecutionContext, ISubtagOptions, Subtag } from '../../structures';

export abstract class BasicSubtag extends Subtag<ExecutionContext> {
    protected constructor(args: Omit<ISubtagOptions<ExecutionContext>, 'contextType'>) {
        super({
            ...args,
            contextType: ExecutionContext
        });
    }
}