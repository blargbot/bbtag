import { Location } from './selection';

export class StateManager {
    public errors: Array<TagError> = [];
    public return: number = 0;
}

export type TagError = { location: Location, code: string, message: string };