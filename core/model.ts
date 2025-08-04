export type LibraryId = string
export type InLibraryId = string
export type BooqId = `${LibraryId}-${InLibraryId}`

export type BooqPath = number[]
export type BooqRange = {
    start: BooqPath,
    end: BooqPath,
}

export type BooqNodeAttrs = {
    [name in string]?: string;
}
export type BooqNodeStyle = {
    [name in string]?: string;
}
export type BooqElementNode = {
    kind: 'element',
    name: string,
    id?: string,
    style?: BooqNodeStyle,
    css?: string,
    children?: BooqNode[],
    attrs?: BooqNodeAttrs,
    fileName?: string,
    ref?: BooqPath,
    pph?: boolean,
}
export type BooqTextNode = string & {
    kind?: undefined,
}
export type BooqStubNode = {
    kind: 'stub',
    length?: number,
} | null
export type BooqNode = BooqElementNode | BooqTextNode | BooqStubNode

export type TableOfContentsItem = {
    title: string | undefined,
    level: number,
    path: BooqPath,
    position: number,
}
export type TableOfContents = {
    title: string | undefined,
    items: TableOfContentsItem[],
}


export type BooqTitle = string
export type BooqAuthor = {
    name: string,
    fileAs?: string,
    role?: string,
}
export type BooqExtraMetadata = {
    name: string,
    value?: string,
    attributes?: Record<string, string | undefined>,
}
export type BooqMetadata = {
    title: BooqTitle,
    authors: BooqAuthor[],
    extra: BooqExtraMetadata[],
    coverSrc: string | undefined,
    length: number,
}
export type Booq = {
    nodes: BooqNode[],
    metadata: BooqMetadata,
    toc: TableOfContents,
}