import { Engine } from '..';
import { DiscordContext, DMMessage, GuildMessage, IDiscordContextArgs } from '../discord';
import { IBlargbot } from './types';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotContextArgs extends IDiscordContextArgs {
    readonly blargbot: IBlargbot;
}

export type BlargbotGuildContext = BlargbotContext & { message: GuildMessage };
export type BlargbotDMContext = BlargbotContext & { message: DMMessage };

export class BlargbotContext extends DiscordContext {
    public readonly type!: typeof BlargbotContext;
    public readonly blargbot: IBlargbot;

    public constructor(engine: Engine<typeof BlargbotContext>, args: IBlargbotContextArgs) {
        super(engine, args);

        this.blargbot = args.blargbot;
    }
}