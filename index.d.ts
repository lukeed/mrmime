export const mimes: Record<string, string>;
export function lookup(extension: string): string | undefined;
export function charset(mimetype: string): string | undefined;
