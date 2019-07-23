import { Engine, ISubtagContextArgs, SubtagContext } from '..';

export type ISystemContextArgs = ISubtagContextArgs;

export class SystemContext extends SubtagContext {
    public readonly type!: typeof SystemContext;

    public constructor(engine: Engine<typeof SystemContext>, args: ISystemContextArgs) {
        super(engine, args);
    }
}