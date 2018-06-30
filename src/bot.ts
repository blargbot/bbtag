import { subtags as bot } from './subtags/bot';
import { subtags as discord } from './discord';

export * from './';
export * from './structures/bot';

export const subtags = [...discord, ...bot];