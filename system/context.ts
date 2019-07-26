import { Engine, ISubtagContextArgs, SubtagContext } from '..';

export type ISystemContextArgs = ISubtagContextArgs;

export class SystemContext extends SubtagContext {
    public readonly type!: typeof SystemContext;

    // @ts-ignore
    private readonly ['__SystemContextDiscriminator__']: undefined;

    public constructor(engine: Engine<SystemContext>, args: ISystemContextArgs) {
        super(engine, args);
    }
}