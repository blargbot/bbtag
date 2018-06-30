import { subtags as math } from './math';
import { subtags as array } from './array';
import { subtags as system } from './system';
import { SubTag } from './util';

export const subtags = [
    ...math,
    ...array,
    ...system
] as Array<typeof SubTag>;