import { Awaitable } from '../../lib';
import { ICollection } from './generic';
import { IGuild } from './guild';
import { Snowflake } from './primitives';
import { ISelfUser, IUser } from './user';

export interface IDiscordClient {
    readonly self: ISelfUser;
    readonly guilds: ICollection<IGuild>;

    getUser(id: Snowflake): Awaitable<IUser>;
}