import { BBTagEngine } from '../../engine';
import { DMMessage, GuildMessage } from '../../external';
import { IBlargBot } from '../../external/blargbot';
import { Context as DiscordContext, IDiscordContextArgs } from '../discord';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotContextArgs extends IDiscordContextArgs {
    readonly blargbot: IBlargBot;
}

export type GuildContext = BlargbotContext & { message: GuildMessage };
export type DMContext = BlargbotContext & { message: DMMessage };

export class BlargbotContext extends DiscordContext {
    public readonly type!: typeof BlargbotContext;
    public readonly blargbot: IBlargBot;

    public constructor(engine: BBTagEngine<typeof BlargbotContext>, args: IBlargbotContextArgs) {
        super(engine, args);

        this.blargbot = args.blargbot;
    }
}