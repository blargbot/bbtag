import { Color, ICollection, IEntity, Permissions } from './generic';
import { ModerationResult } from './instances';
import { IGuildMember, IUser } from './user';

export interface IRole extends IEntity {
    readonly name: string;
    readonly mention: string;
    readonly members: ICollection<IGuildMember>;

    edit(moderator: IUser, options: Partial<IRoleCreateOptions>, reason?: string): Promise<ModerationResult>;
    delete(moderator: IUser, reason?: string): Promise<ModerationResult>;
}

export interface IRoleCreateOptions {
    readonly name: string;
    readonly color: Color;
    readonly permissions: Permissions;
    readonly mentionable: boolean;
    readonly hoisted: boolean;
}