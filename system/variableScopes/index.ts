import { IVariableScope, SubtagContext } from '../..';
import { default as global } from './global';
import { default as local } from './local';
import { default as temporary } from './temporary';

export const variableScopes: Array<IVariableScope<SubtagContext>> = [
    global,
    local,
    temporary
];