import { ISubtag, IVariableScope } from '../../structures';
import { subtags as dSubtags, variableScopes as dVariableScopes } from '../discord';
import { BlargbotContext } from './context';
import { subtags as bSubtags } from './subtags';
import { variableScopes as bVariableScopes } from './variableScopes';

export { BlargbotContext as Context, IBlargbotContextArgs } from './context';
export const subtags = [...dSubtags as Array<ISubtag<BlargbotContext>>, ...bSubtags];
export const variableScopes = [...dVariableScopes as Array<IVariableScope<BlargbotContext>>, ...bVariableScopes];