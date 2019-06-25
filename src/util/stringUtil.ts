export function format(pattern: string, items: any[]): string;
export function format(pattern: string, ...items: any[]): string;
export function format(pattern: string, ...items: any[]): string {
    if (items.length === 1 && Array.isArray(items[0])) {
        items = items[0];
    }
    return pattern.replace(/\{(\d+)\}/, (match, n) => n in items ? items[n] : match);
}