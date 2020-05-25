export type BooqPath = number[];
export type BooqNodeAttrs = {
    [name in string]?: string;
};
export type StyleDeclaration = {
    property: string,
    value: string | undefined,
};
export type BooqNodeStyle = StyleDeclaration[];
export type BooqNode = {
    name?: string,
    id?: string,
    style?: BooqNodeStyle,
    children?: BooqNode[],
    attrs?: BooqNodeAttrs,
    content?: string,
    offset?: number,
    fileName?: string,
}

export function booqHref(booqId: string, path?: BooqPath) {
    return path?.length
        ? `/booq/${booqId}/path/${pathToString(path)}`
        : `/booq/${booqId}`;
}

export function feedHref() {
    return '/';
}

const separator = '-';
export function pathToString(path: BooqPath): string {
    return path.join(separator);
}

export function pathFromString(pathString: string): BooqPath | undefined {
    const path = pathString
        .split(separator)
        .map(c => parseInt(c, 10));
    return path.some(isNaN)
        ? undefined
        : path;
}
