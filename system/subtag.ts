import { ISubtagArgs, Subtag } from '..';
import { SystemContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface ISystemSubtagArgs<T extends SystemContext = SystemContext> extends ISubtagArgs<T> {
    // TODO: define ISystemSubtagArgs
}

export class SystemSubtag<T extends SystemContext = SystemContext> extends Subtag<T> {
    protected constructor(args: ISystemSubtagArgs<T>) {
        super(args);
    }
}