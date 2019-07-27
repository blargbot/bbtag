import { Constructor, ISubtagArgs, Subtag, SubtagContext } from '../lib';

// tslint:disable-next-line: no-empty-interface
export interface ISystemSubtagArgs<T extends SubtagContext = SubtagContext> extends ISubtagArgs<T> {
    // TODO: define ISystemSubtagArgs
}

export class SystemSubtagBase<T extends SubtagContext> extends Subtag<T> {
    protected constructor(context: Constructor<T>, args: ISystemSubtagArgs<T>) {
        super(context, args);
    }
}

export class SystemSubtag extends SystemSubtagBase<SubtagContext> {
    public constructor(args: ISystemSubtagArgs<SubtagContext>) {
        super(SubtagContext, args);
    }
}