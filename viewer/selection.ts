import { BooqRange, pathLessThan, pathFromString, DATASET_PATH, DATA_AUGMENTATION_ID } from '@/core'

export type BooqSelection = {
    range: BooqRange,
    text: string,
    prefix: string,
    suffix: string,
}

// TODO: naming?
type ClientRect = {
    x: number,
    y: number,
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number,
}
type DomClientRects = {
    readonly length: number,
    item(index: number): ClientRect | null,
    [index: number]: ClientRect,
}
// TODO: veryfy that ClientRects is correct
type ClientRects = ClientRect[]
export type VirtualElement = {
    getBoundingClientRect(): ClientRect,
    getClientRects?(): ClientRects,
}

export function getSelectionElement(): VirtualElement | undefined {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0)
        if (range) {
            return {
                getBoundingClientRect() {
                    return range.getBoundingClientRect()
                },
                getClientRects() {
                    return fromDomClientRects(range.getClientRects())
                },
            }
        }
    }
    return undefined
}

export function getAugmentationElement(augmentationId: string): VirtualElement | undefined {
    const elementsList = window.document.querySelectorAll(`span[${DATA_AUGMENTATION_ID}='${augmentationId}']`)
    const elements = Array.from(elementsList)
    if (elements.length === 0) {
        return undefined
    }
    return {
        getBoundingClientRect() {
            // TODO: make sure it is okay to return first element
            return elements[0].getBoundingClientRect()
        },
        getClientRects() {
            const rects: ClientRects = []
            for (const element of Array.from(elements)) {
                const elementRects = element.getClientRects()
                rects.push(...fromDomClientRects(elementRects))
            }
            return rects
        }
    }
}

export function getAugmentationText(augmentationId: string): string {
    const elements = Array.from(window.document.querySelectorAll(`span[${DATA_AUGMENTATION_ID}='${augmentationId}']`))
    let text = ''
    for (const element of elements) {
        text += element.textContent
    }
    return text
}

const CONTEXT_LENGTH = 30

function findBlockAncestor(node: Node): HTMLElement | null {
    let current: Node | null = node
    while (current && current !== document.body) {
        if (current instanceof HTMLElement) {
            const display = window.getComputedStyle(current).display
            if (display === 'block' || display === 'flex' || display === 'grid') {
                return current
            }
        }
        current = current.parentNode
    }
    return document.body
}

export function getBooqSelection(): BooqSelection | undefined {
    const selection = window.getSelection()
    if (!selection || !selection.anchorNode || !selection.focusNode) {
        return undefined
    }

    const anchorPath = getSelectionPath(selection.anchorNode, selection.anchorOffset)
    const focusPath = getSelectionPath(selection.focusNode, selection.focusOffset)

    if (anchorPath && focusPath) {
        const range = pathLessThan(anchorPath, focusPath) ? { start: anchorPath, end: focusPath }
            : pathLessThan(focusPath, anchorPath) ? { start: focusPath, end: anchorPath }
                : undefined
        if (range) {
            const text = selection.toString()
            const { prefix, suffix } = extractSelectionContext(selection)
            return {
                range, text, prefix, suffix,
            }
        }

    }
    return undefined
}

function extractSelectionContext(selection: Selection): { prefix: string, suffix: string } {
    if (selection.rangeCount === 0) {
        return { prefix: '', suffix: '' }
    }
    const domRange = selection.getRangeAt(0)
    const container = domRange.commonAncestorContainer
    const blockAncestor = findBlockAncestor(container)

    if (!blockAncestor) {
        return { prefix: '', suffix: '' }
    }

    const beforeRange = document.createRange()
    beforeRange.selectNodeContents(blockAncestor)
    beforeRange.setEnd(domRange.startContainer, domRange.startOffset)
    const prefix = beforeRange.toString().slice(-CONTEXT_LENGTH)

    const afterRange = document.createRange()
    afterRange.selectNodeContents(blockAncestor)
    afterRange.setStart(domRange.endContainer, domRange.endOffset)
    const suffix = afterRange.toString().slice(0, CONTEXT_LENGTH)

    return { prefix, suffix }
}

function getSelectionPath(node: Node, offset: number) {
    const pathAttr = (node as HTMLElement).dataset?.[DATASET_PATH]
    if (pathAttr) {
        const path = pathFromString(pathAttr)
        if (path) {
            return [...path, offset, 0]
        }
    } else if (node.parentElement) {
        const parentPathAttr = node.parentElement.dataset?.[DATASET_PATH]
        if (parentPathAttr) {
            const path = pathFromString(parentPathAttr)
            if (path) {
                path[path.length - 1] += offset
                return path
            }
        }
    }
    return undefined
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unionRect(a: ClientRect, b: ClientRect): ClientRect {
    const top = Math.min(a.top, b.top)
    const left = Math.min(a.left, b.left)
    const bottom = Math.max(a.bottom, b.bottom)
    const right = Math.max(a.right, b.right)
    const x = Math.min(a.x, b.x)
    const y = Math.min(a.y, b.y)
    const width = right - left
    const height = bottom - top
    return {
        top, left, bottom, right,
        x, y,
        width, height,
    }
}

function fromDomClientRects(domClientRects: DomClientRects): ClientRects {
    const rects: ClientRects = []
    for (let i = 0; i < domClientRects.length; i++) {
        const domRect = domClientRects.item(i)
        if (domRect) {
            rects.push(domRect)
        }
    }
    return rects
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toDomClientRects(rects: ClientRects): DomClientRects {
    const object: DomClientRects = {
        length: rects.length,
        item(index: number) {
            return rects[index]
        },
    }
    rects.forEach((rect, index) => {
        object[index] = rect
    })
    return object
}