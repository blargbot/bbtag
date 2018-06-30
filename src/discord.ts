import { subtags as discord } from './subtags/discord';
import { subtags as general } from './';

export * from './';
export * from './structures/discord';

export const subtags = [...general, ...discord];