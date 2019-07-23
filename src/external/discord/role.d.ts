import { IEntity, ICollection, Color, Permissions } from './generic';
import { IGuildMember, IUser } from './user';
import { ModerationResult } from './instances';

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