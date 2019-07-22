export { BBTagEngine as Engine } from './engine';
export { Subtag, DiscordContext, BlargbotContext, SubtagContext, variableScopes } from './structures';
import * as _util from './util';

export * from './external';

import { default as s, system } from './subtags';
export const util = _util;
export const subtags = {
    all: s,
    system
};