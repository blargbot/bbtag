import { BBTagEngine } from '../../engine';
import { Context as SubtagContext, ISubtagContextArgs } from '../system';

// tslint:disable-next-line: no-empty-interface
export interface IDiscordContextArgs extends ISubtagContextArgs {
    // TODO define IDiscordContextArgs
}

export class DiscordContext extends SubtagContext {
    public readonly type!: typeof DiscordContext;

    public readonly discrim2!: number; // TODO Remove this as it is temporary to force clashes between the context types

    public constructor(engine: BBTagEngine<typeof DiscordContext>, args: IDiscordContextArgs) {
        super(engine, args);
    }
}