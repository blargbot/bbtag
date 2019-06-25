// tslint:disable-next-line: interface-name
declare interface String {
    format(...items: any[]): string;
}

String.prototype.format = function format(this: string, ...items: any[]): string {
    return this.replace(/\{(\d+)\}/, (match, n) => n in items ? items[n] : match);
};