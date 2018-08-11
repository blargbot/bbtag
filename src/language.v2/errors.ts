import { BBStructure } from './structure';
import { Context } from './context';

export class BBError {
    public readonly structure: BBStructure;
    public readonly code: string;
    public readonly message: string;

    constructor(context: Context, structure: BBStructure, code: string, message: string) {
        this.structure = structure;
        this.code = code;
        this.message = message;

        context.addError(this);
    }

    toString() {
        return `\`[${this.code}] ${this.message}\``;
    }
}

export class ArgumentError extends BBError {
    constructor(context: Context, structure: BBStructure, code: string, message: string) {
        super(context, structure, 'ARG-' + code, message);
    }
}

function nameText(argName: string, argPosition?: number) {
    return `${argName}${argPosition === undefined ? '' : `/${argPosition}`}`;
}

export const errors = {
    argument: {
        missing(context: Context, structure: BBStructure, argName: string, argPosition?: number) {
            return new ArgumentError(context, structure, 'MISSING',
                `The argument ${nameText(argName, argPosition)} is missing`
            );
        },
        named: {
            tooMany(context: Context, structure: BBStructure, argName: string, argPosition?: number) {
                return new ArgumentError(context, structure, 'TOOMANY',
                    `Too many values were supplied for the ${nameText(argName, argPosition)} argument`
                );
            }
        }
    }
};