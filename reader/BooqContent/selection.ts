import { pathLessThan } from "core";
import { pathFromId } from "app";
import type { BooqSelection } from './BooqContent';

export function getBooqSelection(): BooqSelection | undefined {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !selection.focusNode) {
        return undefined;
    }

    const anchorPath = getSelectionPath(selection.anchorNode, selection.anchorOffset);
    const focusPath = getSelectionPath(selection.focusNode, selection.focusOffset);

    if (anchorPath && focusPath) {
        const range = pathLessThan(anchorPath, focusPath) ? { start: anchorPath, end: focusPath }
            : pathLessThan(focusPath, anchorPath) ? { start: focusPath, end: anchorPath }
                : undefined;
        if (range) {
            const text = selection.toString();
            return {
                range, text,
            };
        }

    }
    return undefined;
}

function getSelectionPath(node: Node, offset: number) {
    if (node.parentElement) {
        const path = pathFromId(node.parentElement.id);
        if (path) {
            path[path.length - 1] += offset;
            return path;
        }
    }
    return undefined;
}