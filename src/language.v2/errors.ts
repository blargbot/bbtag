import { BBStructure } from './structure';

export class BBError {
    public readonly structure: BBStructure;
    public readonly code: string;
    public readonly message: string;

    constructor(context: any, structure: BBStructure, code: string, message: string) {
        this.structure = structure;
        this.code = code;
        this.message = message;

        context.addError(this);
    }

    toString() {
        return `\`[${this.code.padEnd(10, ' ')}]: ${this.message}\``;
    }
}


export class ArgumentError extends BBError {
    constructor(context: any, structure: BBStructure, message: string) {
        super(context, structure, 'ARGUMENT', message);
    }
}