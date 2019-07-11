export * from './types';
export { ISerializer } from './serialize';
export { ICollection } from './convert';

import * as compare from './compare';
import * as converter from './convert';
import * as parse from './parse';
import * as serializer from './serialize';

export let bbtag = {
    ...parse,
    ...compare,
    ...converter,
    ...serializer
};