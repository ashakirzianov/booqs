import { pathToString, BooqPath, pathFromString } from "./core";

export function booqHref(booqId: string, path?: BooqPath) {
    return path?.length
        ? `/booq/${booqId}/path/${pathToString(path)}`
        : `/booq/${booqId}`;
}

export function feedHref() {
    return '/';
}

const idPrefix = 'path:';
export function pathToId(path: BooqPath): string {
    return `${idPrefix}${pathToString(path)}`;
}

export function pathFromId(id: string): BooqPath | undefined {
    if (id.startsWith(idPrefix)) {
        const pathString = id.substr(idPrefix.length);
        return pathFromString(pathString);
    } else {
        return undefined;
    }
}
