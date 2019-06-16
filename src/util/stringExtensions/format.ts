declare interface String {
    format(...items: any[]): string;
}

String.prototype.format = function format(this: string, ...items: any[]): string {
    return this.replace(/\{(\d+)\}/, function (match, number) {
        return number in items ? items[number] : match;
    });
}