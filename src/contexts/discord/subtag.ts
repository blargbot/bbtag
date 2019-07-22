import { Subtag } from '../../structures';
import { ISystemSubtagArgs } from '../system';
import { DiscordContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IDiscordSubtagArgs extends ISystemSubtagArgs {
    // TODO: define IDiscordSubtagArgs
}

export class DiscordSubtag extends Subtag<DiscordContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super({
            ...args,
            contextType: DiscordContext
        });
    }
}