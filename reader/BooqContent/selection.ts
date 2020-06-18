import { useRef, useCallback } from "react";
import { pathLessThan } from "core";
import { pathFromId } from "app";
import { useDocumentEvent } from "controls/utils";
import type { BooqSelection } from './BooqContent';

export function useOnSelection(callback?: (selection?: BooqSelection) => void) {
    const locked = useRef(false);
    const unhandled = useRef(false);
    const lock = () => locked.current = true;
    const unlock = () => {
        locked.current = false;
        if (callback && unhandled.current) {
            const selection = getSelection();
            callback(selection);
            unhandled.current = false;
        }
    };
    useDocumentEvent('mouseup', unlock);
    useDocumentEvent('mousemove', event => {
        if (event.buttons) {
            lock();
        } else {
            unlock();
        }
    });

    const selectionHandler = useCallback(event => {
        if (callback) {
            if (!locked.current) {
                const selection = getSelection();
                callback(selection);
            } else {
                unhandled.current = true;
            }
        }
    }, [callback]);

    // Note: handle click as workaround for dead context menu
    useDocumentEvent('click', selectionHandler);
    useDocumentEvent('selectionchange', selectionHandler);
}

function getSelection(): BooqSelection | undefined {
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