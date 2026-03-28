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
export type BooqSectionNode = {
    section: string,
    styleRefs?: string[],
    children: BooqNode[],
    name?: undefined,
    stub?: undefined,
}
export type BooqElementNode = {
    name: string,
    id?: string,
    children: BooqNode[],
    attrs?: BooqNodeAttrs,
    ref?: BooqPath,
    /** Marks this node as a paragraph. Set by the parser's markParagraphs pass.
     * The viewer uses it to add a `booqs-pph` CSS class for scroll position tracking. */
    pph?: boolean,
    section?: undefined,
    stub?: undefined,
}
export type BooqTextNode = string & {
    children?: undefined,
    section?: undefined,
    name?: undefined,
    stub?: undefined,
}
export type BooqStubNode = {
    stub: number,
    children?: undefined,
    section?: undefined,
    name?: undefined,
} | null
export type BooqNode = BooqSectionNode | BooqElementNode | BooqTextNode | BooqStubNode

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
export type BooqStyles = Record<string, string>
export type Booq = {
    nodes: BooqNode[],
    styles: BooqStyles,
    metadata: BooqMetadata,
    toc: TableOfContents,
}