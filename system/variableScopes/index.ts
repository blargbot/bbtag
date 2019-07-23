import { IVariableScope } from '../..';
import { SystemContext } from '../context';
import { default as global } from './global';
import { default as local } from './local';
import { default as temporary } from './temporary';

export const variableScopes: Array<IVariableScope<SystemContext>> = [
    global,
    local,
    temporary
];