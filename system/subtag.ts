import { ISubtagArgs, Subtag } from '..';
import { SubtagContext } from '../lib';

// tslint:disable-next-line: no-empty-interface
export interface ISystemSubtagArgs<T extends SubtagContext = SubtagContext> extends ISubtagArgs<T> {
    // TODO: define ISystemSubtagArgs
}

export class SystemSubtag<T extends SubtagContext = SubtagContext> extends Subtag<T> {
    protected constructor(args: ISystemSubtagArgs<T>) {
        super(args);
    }
}