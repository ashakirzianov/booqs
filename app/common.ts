import { pathToString, BooqPath, pathFromString } from "core";

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

export function pageForPosition(position: number): number {
    return Math.ceil(position / 2500);
}
