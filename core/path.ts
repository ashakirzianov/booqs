import { BooqPath, BooqRange } from './model'

const PATH_SEPARATOR = '-'
export function pathToString(path: BooqPath): string {
    return path.join(PATH_SEPARATOR)
}

export function pathFromString(pathString: string): BooqPath | undefined {
    const path = pathString
        .split(PATH_SEPARATOR)
        .map(c => parseInt(c, 10))
    return path.some(isNaN)
        ? undefined
        : path
}

const ID_PREFIX = 'path:'
export function pathToId(path: BooqPath): string {
    return `${ID_PREFIX}${pathToString(path)}`
}

export function pathFromId(id: string): BooqPath | undefined {
    if (id.startsWith(ID_PREFIX)) {
        const pathString = id.substring(ID_PREFIX.length)
        return pathFromString(pathString)
    } else {
        return undefined
    }
}

export function samePath(first: BooqPath, second: BooqPath) {
    return first.length === second.length
        && first.every((p, idx) => p === second[idx])
}

export function pathLessThan(first: BooqPath, second: BooqPath): boolean {
    const [firstHead, ...firstTail] = first
    const [secondHead, ...secondTail] = second
    if (secondHead === undefined) {
        return false
    } else if (firstHead === undefined) {
        return true
    } else if (firstHead === secondHead) {
        return pathLessThan(firstTail, secondTail)
    } else {
        return firstHead < secondHead
    }
}

export function comparePaths(first: BooqPath, second: BooqPath): number {
    return pathLessThan(first, second) ? -1
        : samePath(first, second) ? 0
            : +1
}

export function pathInRange(path: BooqPath, range: BooqRange): boolean {
    return pathLessThan(path, range.start)
        ? false
        : (
            range.end
                ? pathLessThan(path, range.end)
                : true
        )
}

const RANGE_SEPARATOR = 'to'
export function rangeToString(range: BooqRange): string {
    return range.end
        ? `${pathToString(range.start)}${RANGE_SEPARATOR}${pathToString(range.end)}`
        : pathToString(range.start)
}

export function rangeFromString(rangeString: string): BooqRange | undefined {
    const [startPart, endPart] = rangeString.split(RANGE_SEPARATOR)
    const start = startPart !== undefined ? pathFromString(startPart) : undefined
    const end = endPart !== undefined ? pathFromString(endPart) : undefined
    return start && end
        ? { start, end }
        : undefined
}

export function isOverlapping(first: BooqRange, second: BooqRange): boolean {
    if (pathLessThan(first.start, second.start)) {
        if (first.end) {
            return pathLessThan(second.start, first.end)
        } else {
            return true
        }
    } else {
        if (second.end) {
            return pathLessThan(first.start, second.end)
        } else {
            return true
        }
    }
}