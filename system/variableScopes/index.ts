import { default as global } from './global';
import { default as local } from './local';
import { default as temporary } from './temporary';

export const variableScopes = [
    global,
    local,
    temporary
];