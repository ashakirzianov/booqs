export type LibraryId = string
export type InLibraryId = string
export type BooqId = `${LibraryId}/${InLibraryId}`

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
    children?: BooqNode[],
    attrs?: BooqNodeAttrs,
    fileName?: string,
    ref?: BooqPath,
    pph?: boolean,
}
export type BooqTextNode = {
    kind: 'text',
    content: string,
}
export type BooqStubNode = {
    kind: 'stub',
    length: number,
}
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

export type BooqMetaTag = [name: string, value?: string]
export type BooqMeta = {
    title: string | undefined,
    authors: string[] | undefined,
    languages: string[] | undefined,
    contributors: string[] | undefined,
    description: string | undefined,
    subjects: string[] | undefined,
    rights: string | undefined,
    coverSrc: string | undefined,
    tags: BooqMetaTag[] | undefined,
}
export type BooqImages = {
    [src: string]: string,
}
export type Booq = {
    nodes: BooqNode[],
    length: number,
    meta: BooqMeta,
    toc: TableOfContents,
    images: BooqImages,
}