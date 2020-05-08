export type BooqTag = {
    tag: string,
    value?: string,
};
export type BooqData = {
    title?: string,
    author?: string,
    cover?: string,
    tags: BooqTag[],
}
