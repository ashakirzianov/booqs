import React, { memo, createElement, ReactNode, useEffect } from 'react';
import { throttle } from 'lodash';
import {
    BooqPath, BooqRange, BooqNode, BooqElementNode, pathToString, pathInRange, pathLessThan,
} from 'core';
import { pathToId, pathFromId } from 'app';
import { booqHref } from 'controls/Links';

export const BooqContent = memo(function BooqContent({
    booqId, nodes, range, onScroll, onSelection,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    onScroll?: (path: BooqPath) => void,
    onSelection?: (selection?: BooqSelection) => void,
}) {
    useScroll(onScroll);
    useSelection(onSelection);
    return <div id='booq-root' className='container'>
        {
            renderNodes(nodes, {
                booqId, range,
                path: [],
            })
        }
    </div>;
});

// --- Render

type RenderContext = {
    booqId: string,
    path: BooqPath,
    range: BooqRange,
    parent?: BooqElementNode,
    withinAnchor?: boolean,
};
function renderNodes(nodes: BooqNode[], ctx: RenderContext): ReactNode {
    const result = nodes.map(
        (n, idx) => renderNode(n, {
            ...ctx,
            path: [...ctx.path, idx],
        }),
    );
    return result;
}
function renderNode(node: BooqNode, ctx: RenderContext): ReactNode {
    switch (node.kind) {
        case 'text':
            switch (ctx.parent?.name) {
                case 'table': case 'tbody': case 'tr':
                    return null;
                default:
                    return node.content;
            }
        case 'stub':
            return null;
        case 'element':
            if (node.name === 'img') {
                return null; //TODO: support images
            }
            return createElement(
                node.name === 'a' && ctx.withinAnchor
                    ? 'span' // Do not nest anchors
                    : node.name,
                getProps(node, ctx),
                getChildren(node, ctx),
            );
    }
}

function getProps(node: BooqElementNode, { path, booqId, range }: RenderContext) {
    return {
        ...node.attrs,
        id: pathToId(path),
        className: node.pph
            ? 'booq-pph' : undefined,
        style: node.style,
        key: pathToString(path),
        href: node.ref
            ? hrefForPath(node.ref, booqId, range)
            : node.attrs?.href,
    };
}

function hrefForPath(path: BooqPath, booqId: string, range: BooqRange): string {
    if (pathInRange(path, range)) {
        return `#${pathToId(path)}`;
    } else {
        return booqHref(booqId, path);
    }
}

function getChildren(node: BooqElementNode, ctx: RenderContext) {
    return node.children?.length
        ? renderNodes(node.children, {
            ...ctx,
            withinAnchor: ctx.withinAnchor || node.name === 'a',
        })
        : null;
}

// --- Scroll

function useScroll(callback?: (path: BooqPath) => void) {
    useEffect(() => {
        const listener = throttle(function () {
            if (callback) {
                const path = getCurrentPath();
                if (path) {
                    callback(path);
                }
            }
        }, 500);
        window.addEventListener('scroll', listener);
        return () => window.removeEventListener('scroll', listener);
    }, [callback]);
}

function getCurrentPath() {
    const root = window.document.getElementById('booq-root');
    const current = root && getCurrent(root);
    return current
        ? pathFromId(current.id)
        : undefined;
}

function getCurrent(element: Element): Element | undefined {
    if (!isPartiallyVisible(element)) {
        return undefined;
    } else if (element.className === 'booq-pph') {
        return element;
    }
    const children = element.children;
    for (let idx = 0; idx < children.length; idx++) {
        const child = children.item(idx);
        const current = child && getCurrent(child);
        if (current) {
            return current;
        }
    }
    return undefined;
}

function isPartiallyVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    if (rect) {
        const { top, height } = rect;
        const result = height > 0 && top <= 0 && top + height >= 0;
        if (result) {
            return result;
        }
    }

    return false;
}

// Selection:

export type BooqSelection = {
    range: BooqRange,
    text: string,
};
function useSelection(callback?: (selection?: BooqSelection) => void) {
    useEffect(() => {
        const listener = function () {
            if (callback) {
                const selection = getSelection();
                callback(selection);
            }
        };
        window.document.addEventListener('selectionchange', listener);
        return () => window.document.removeEventListener('selectionchange', listener);
    }, [callback]);
}

function getSelection(): BooqSelection | undefined {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !selection.focusNode) {
        return undefined;
    }

    const anchorPath = getSelectionPath(selection.anchorNode, selection.anchorOffset);
    const focusPath = getSelectionPath(selection.focusNode, selection.focusOffset);

    if (anchorPath && focusPath) {
        const range = pathLessThan(anchorPath, focusPath)
            ? { start: anchorPath, end: focusPath }
            : { start: focusPath, end: anchorPath };
        const text = selection.toString();
        return { range, text };
    } else {
        return undefined;
    }
}

function getSelectionPath(node: Node, offset: number) {
    if (isElement(node)) {
        return pathFromId(node.id);
    } else if (node.parentElement) {
        const path = pathFromId(node.parentElement.id);
        return path
            ? [...path, offset]
            : undefined;
    } else {
        return undefined;
    }
}

function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}