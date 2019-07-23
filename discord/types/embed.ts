export interface IEmbed {
    readonly fields?: readonly IEmbedField[];
}

export interface IEmbedField {
    readonly name: string;
    readonly value: string;
    readonly inline?: boolean;
}

// TODO: Complete embed definition