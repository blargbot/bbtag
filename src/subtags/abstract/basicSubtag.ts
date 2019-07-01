import { ExecutionContext, Subtag } from '../../models';
import { ISubtagArguments } from '../../models/subtag';

export abstract class BasicSubtag extends Subtag<ExecutionContext> {
    protected constructor(args: Omit<ISubtagArguments<ExecutionContext>, 'contextType'>) {
        super({
            ...args,
            contextType: ExecutionContext
        });
    }
}