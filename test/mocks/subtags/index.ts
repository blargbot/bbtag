import { SubTag } from './util';
import { Join } from './join';
import { Echo } from './echo';
import { ISE } from './ise';
import { Func } from './func';

export const subtags = [
    Join,
    Echo,
    Func,
    ISE
] as Array<typeof SubTag>