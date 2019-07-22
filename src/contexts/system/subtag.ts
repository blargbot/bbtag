import { ISubtagOptions, Subtag } from '../../structures';
import { SystemContext } from './context';

export interface ISystemSubtagArgs extends Omit<ISubtagOptions<SystemContext>, 'contextType'> {

}

export class SystemSubtag extends Subtag<SystemContext> {
    protected constructor(args: ISystemSubtagArgs) {
        super({
            ...args,
            contextType: SystemContext
        });
    }
}