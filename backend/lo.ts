import { join } from 'path'
import { promisify } from 'util'
import { readFile } from 'fs'
import { InLibraryCard, Library } from './library'

const epubsRoot = join('public', 'epubs')
export const localLibrary: Library = {
    async search() { return [] },
    async forAuthor() { return [] },
    async cards(ids: string[]) {
        return ids.map(function (id): InLibraryCard {
            return {
                id,
                authors: [],
                length: 0,
                title: undefined,
                languages: [],
                description: undefined,
                subjects: [],
                coverUrl: undefined,
                tags: [],
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