export * from './types';
export { ISerializer } from './serializer';
export { ICollection } from './converter';

import * as compare from './compare';
import * as converter from './converter';
import * as parse from './parse';
import * as serializer from './serializer';

export let bbtag = {
    ...parse,
    ...compare,
    ...converter,
    ...serializer
};