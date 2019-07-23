import { ISubtag, IVariableScope } from '../../structures';
import { subtags as sSubtags, variableScopes as sVariableScopes } from '../system';
import { DiscordContext } from './context';
import { subtags as dSubtags } from './subtags';
import { variableScopes as dVariableScopes } from './variableScopes';

export { IDiscordSubtagArgs } from './subtag';
export { DiscordContext as Context, IDiscordContextArgs } from './context';
export const subtags = [...sSubtags as Array<ISubtag<DiscordContext>>, ...dSubtags];
export const variableScopes = [...sVariableScopes as Array<IVariableScope<DiscordContext>>, ...dVariableScopes];