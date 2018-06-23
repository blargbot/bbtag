import { Engine } from "../../dist/engine";
import { MockDb } from "./mockDatabase";

export class MockEngine extends Engine {
    constructor() {
        super(new MockDb());
    }
}