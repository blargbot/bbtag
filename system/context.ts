import { BBTagEngine, ISubtagContextArgs, SubtagContext } from '..';

// tslint:disable-next-line: no-empty-interface
export interface ISystemContextArgs extends ISubtagContextArgs {
    // TODO: define ISystemContextArgs
}

export class SystemContext extends SubtagContext {
    public readonly type!: typeof SystemContext;

    public constructor(engine: BBTagEngine<typeof SystemContext>, args: ISystemContextArgs) {
        super(engine, args);
    }
}