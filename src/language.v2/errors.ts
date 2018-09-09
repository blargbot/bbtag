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

export class NamedArgError extends ArgumentError {
    constructor(context: Context, structure: BBStructure, code: string, message: string) {
        super(context, structure, 'NAMED-' + code, message);
    }
}

export const errors = {
    argument: {
        missing(context: Context, structure: BBStructure, argName: string) {
            return new ArgumentError(context, structure, 'MISSING',
                `The argument ${argName} is missing`
            );
        },
        tooMany(context: Context, structure: BBStructure) {
            return new ArgumentError(context, structure, 'TOOMANY',
                `Too many arguments`
            );
        },
        notEnough(context: Context, structure: BBStructure) {
            return new ArgumentError(context, structure, 'NOTENOUGH',
                `Not enough arguments`
            );
        },
        named: {
            tooMany(context: Context, structure: BBStructure, argName: string) {
                return new NamedArgError(context, structure, 'TOOMANY',
                    `Too many values were supplied for the ${argName} argument`
                );
            }
        }
    }
};