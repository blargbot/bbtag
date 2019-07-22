import { ISubtagOptions, Subtag } from '../../structures';
import { SystemContext } from './context';

export class SystemSubtag extends Subtag<SystemContext> {
    protected constructor(args: Omit<ISubtagOptions<SystemContext>, 'contextType'>) {
        super({
            ...args,
            contextType: SystemContext
        });
    }
}