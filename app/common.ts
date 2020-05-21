export function booqHref(booqId: string) {
    return `/book/${booqId}`;
}

export type BooqPath = number[];
export function pathToString(path: BooqPath) {
    return path.join('/');
}
