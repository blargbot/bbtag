import { SystemSubTag } from "../../../dist/structures/subtag";
import { Engine } from "../../../dist/engine";

export class MockSubTag extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'mock');
    }
}