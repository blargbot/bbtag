import { ISubtagOptions, Subtag } from '../../structures';
import { DiscordContext } from './context';

export class DiscordSubtag extends Subtag<DiscordContext> {
    protected constructor(args: Omit<ISubtagOptions<DiscordContext>, 'contextType'>) {
        super({
            ...args,
            contextType: DiscordContext
        });
    }
}