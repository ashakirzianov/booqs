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
    return `/book/${booqId}`;
}

export function pathToString(path: BooqPath) {
    return path.join('/');
}
