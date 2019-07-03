import { ExecutionContext, ISubtagArguments, Subtag } from '../../structures';

export abstract class BasicSubtag extends Subtag<ExecutionContext> {
    protected constructor(args: Omit<ISubtagArguments<ExecutionContext>, 'contextType'>) {
        super({
            ...args,
            contextType: ExecutionContext
        });
    }
}