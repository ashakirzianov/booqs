import { pathLessThan } from 'core'
import { pathFromId } from 'app'
import type { BooqSelection } from './BooqContent'

export type AnchorRect = {
    top: number,
    left: number,
    height: number,
    width: number,
};

export function getSelectionRect(): AnchorRect | undefined {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0)
            ?.getBoundingClientRect()
        return rect
            ? {
                top: rect.top, left: rect.left,
                height: rect.height, width: rect.width,
            } : undefined
    } else {
        return undefined
    }
}

export function getAugmentationRect(augmentationId: string): AnchorRect | undefined {
    const elements = window.document.querySelectorAll(`span[data-augmentation-id='${augmentationId}']`)
    let curr: AnchorRect | undefined = undefined
    for (const [_, element] of elements.entries()) {
        const domRect = element.getBoundingClientRect()
        const anchorRect = {
            top: domRect.top, left: domRect.left,
            width: domRect.width, height: domRect.height,
        }
        if (curr) {
            curr = unionRect(curr, anchorRect)
        } else {
            curr = anchorRect
        }
    }
    return curr
}

export function getAugmentationText(augmentationId: string): string {
    const elements = window.document.querySelectorAll(`span[data-augmentation-id='${augmentationId}']`)
    let text = ''
    for (const [_, element] of elements.entries()) {
        text += element.textContent
    }
    return text
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
            return {
                range, text,
            }
        }

    }
    return undefined
}

function getSelectionPath(node: Node, offset: number) {
    // Note: hackie
    if ((node as any).id) {
        const path = pathFromId((node as any).id)
        if (path) {
            return [...path, offset, 0]
        }
    } else if (node.parentElement) {
        const path = pathFromId(node.parentElement.id)
        if (path) {
            path[path.length - 1] += offset
            return path
        }
    }
    return undefined
}

function unionRect(a: AnchorRect, b: AnchorRect): AnchorRect {
    const top = Math.min(a.top, b.top)
    const left = Math.min(a.left, b.left)
    const width = Math.max(a.left + a.width, b.left + b.width) - left
    const height = Math.max(a.top + a.height, b.top + b.height) - top
    return {
        top, left, width, height,
    }
}