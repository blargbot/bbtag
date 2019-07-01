import './util';
export { Engine } from './engine';
export { Subtag } from './models';

import { default as s, system } from './subtags';
export const subtags = {
    all: s,
    system
};