import { Location } from "./selection";

export class StateManager {
    public errors: Array<TagError> = [];
}

export type TagError = { location: Location, code: string, message: string }