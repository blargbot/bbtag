import { ICollection, IDiscordClient, IGuild, ISelfUser, IUser, Snowflake } from '../discord';
import { Awaitable, Enumerable } from '../lib';

export class InMemoryDiscord implements IDiscordClient {
    public self: ISelfUser;
    public guilds: ICollection<IGuild>;

    public constructor() {
        this.self = undefined!;
        this.guilds = undefined!;
    }

    public getUser(id: Snowflake): Awaitable<IUser> {
        return Enumerable.from(this.guilds)
            .selectMany(g => g.members)
            .select(m => m.user)
            .first(m => m.id === id);
    }

}