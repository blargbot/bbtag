import { ISubtagOptions, Subtag } from '../../structures';
import { SystemContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface ISystemSubtagArgs extends ISubtagOptions {
    // TODO: define ISystemSubtagArgs
}

export class SystemSubtag extends Subtag<SystemContext> {
    protected constructor(args: ISystemSubtagArgs) {
        super(args);
    }
}