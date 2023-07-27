import { pathToString, BooqPath, pathFromString } from '@/core'

const idPrefix = 'path:'
export function pathToId(path: BooqPath): string {
    return `${idPrefix}${pathToString(path)}`
}

export function pathFromId(id: string): BooqPath | undefined {
    if (id.startsWith(idPrefix)) {
        const pathString = id.substr(idPrefix.length)
        return pathFromString(pathString)
    } else {
        return undefined
    }
}

export function pageForPosition(position: number): number {
    return Math.ceil(position / 2500)
}

export function currentSource(): string {
    return 'default/0'
}

const defaultColor = 'rgba(255, 215, 0, 0.6)'
const groupColorMapping: {
    [group in string]: string | undefined;
} = {
    first: defaultColor,
    second: 'rgba(135, 206, 235, 0.6)',
    third: 'rgba(240, 128, 128, 0.6)',
    forth: 'rgba(75, 0, 130, 0.6)',
    fifth: 'rgba(34, 139, 34, 0.6)',
}
export function colorForGroup(group: string) {
    return groupColorMapping[group] ?? defaultColor
}
export const quoteColor = 'rgba(255, 165, 0, 0.6)'
export const groups = Object.keys(groupColorMapping)
