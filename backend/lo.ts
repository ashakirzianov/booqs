import { join } from 'path'
import { promisify } from 'util'
import { readFile } from 'fs'
import { InLibraryCard, Library } from './library'

const epubsRoot = join('public', 'epubs')
export const localLibrary: Library = {
    async query() { return { cards: [] } },
    async cards(ids: string[]) {
        return ids.map(function (id): InLibraryCard {
            return {
                id,
                meta: {
                    title: 'Unknown',
                    authors: [],
                    extra: [],
                    coverSrc: undefined,
                    length: 0,
                },
            }
        })
    },
    async fileForId(id: string) {
        const path = join(epubsRoot, `${id}.epub`)
        try {
            const file = await promisify(readFile)(path)
            return {
                kind: 'epub',
                file,
            }
        } catch (err) {
            console.error(`Couldn't open ${path}: ${err}`)
            return undefined
        }
    },
}