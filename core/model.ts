export type LibraryId = string
export type InLibraryId = string
export type BooqId = `${LibraryId}-${InLibraryId}`

export type BooqPath = number[]
export type BooqRange = {
    start: BooqPath,
    end: BooqPath,
}

export type BooqElementAttributes = {
    [name in string]?: string;
}
export type BooqDocument = {
    fileName: string,
    styleRefs?: string[],
    children: BooqChildNode[],
    error?: string,
    name?: undefined,
    stub?: undefined,
}
export type BooqElement = {
    name: string,
    children: BooqChildNode[],
    attributes?: BooqElementAttributes,
    /** Marks this node as a paragraph. Set by the parser's markParagraphs pass.
     * The viewer uses it to add a `booqs-pph` CSS class for scroll position tracking. */
    pph?: boolean,
    fileName?: undefined,
    stub?: undefined,
}
export type BooqTextNode = string & {
    children?: undefined,
    name?: undefined,
    fileName?: undefined,
    stub?: undefined,
}
export type BooqStub = {
    stub: number,
    children?: undefined,
    fileName?: undefined,
    name?: undefined,
} | null
export type BooqChildNode = BooqElement | BooqTextNode | BooqStub
export type BooqNode = BooqDocument | BooqChildNode

export type TableOfContentsItem = {
    title: string | undefined,
    level: number,
    path: BooqPath,
    position: number,
    id?: string,
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
    content: BooqDocument[],
    styles: BooqStyles,
    metadata: BooqMetadata,
    toc: TableOfContents,
}
