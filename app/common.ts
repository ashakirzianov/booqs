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

export function booqHref(booqId: string) {
    return `/booq/${booqId}`;
}

export function pathToString(path: BooqPath) {
    return path.join('/');
}

export function pathFromString(pathString: string): BooqPath | undefined {
    const path = pathString
        .split('/')
        .map(c => parseInt(c, 10));
    return path.some(isNaN)
        ? undefined
        : path;
}
