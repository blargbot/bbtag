import { subtags as channel } from './channel';
import { subtags as guild } from './guild';
import { subtags as message } from './message';
import { subtags as role } from './role';
import { subtags as user } from './user';
import { SubTag } from './util';

export const subtags = [
    ...channel,
    ...guild,
    ...message,
    ...role,
    ...user
] as Array<typeof SubTag>;