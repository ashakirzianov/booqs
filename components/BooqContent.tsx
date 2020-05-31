import React, { memo, createElement, ReactNode, useEffect } from 'react';
import { throttle } from 'lodash';
import {
    BooqPath, BooqRange, BooqNode, BooqElementNode, pathToString, pathInRange, pathLessThan, samePath,
} from 'core';
import { pathToId, pathFromId } from 'app';
import { booqHref } from 'controls/Links';

export type Colorization = {
    range: BooqRange,
    color: string,
};
export const BooqContent = memo(function BooqContent({
    booqId, nodes, range, colorization, onScroll, onSelection,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    colorization: Colorization[],
    onScroll?: (path: BooqPath) => void,
    onSelection?: (selection?: BooqSelection) => void,
}) {
    useScroll(onScroll);
    useSelection(onSelection);
    return <div id='booq-root' className='container'>
        {
            renderNodes(nodes, {
                booqId, range, colorization,
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
    colorization: Colorization[],
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
                    return renderTextNode(node.content, ctx);
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

function renderTextNode(text: string, { path, colorization }: RenderContext): ReactNode {
    const spans = applyColorization({ text, path: [...path, 0] }, colorization);
    const id = pathToId(path);
    return <span
        key={id}
        id={id}
    >
        {
            spans.map(
                span => {
                    if (span.color) {
                        return <span
                            id={pathToId(span.path)}
                            key={pathToId(span.path)}
                            style={{ background: span.color }}>
                            {span.text}
                        </span>;
                    } else {
                        return span.text;
                    }
                }
            )
        }
    </span>;
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
            parent: node,
            withinAnchor: ctx.withinAnchor || node.name === 'a',
        })
        : null;
}

// --- Colorization

type ColorizedSpan = {
    path: BooqPath,
    text: string,
    color?: string,
};

function applyColorization(span: ColorizedSpan, colorization: Colorization[]) {
    return colorization.reduce(
        (res, col) => {
            const spans = applyColorizationOnSpans(res, col);
            return spans;
        },
        [span],
    );
}

function applyColorizationOnSpans(spans: ColorizedSpan[], colorization: Colorization) {
    return spans.reduce<ColorizedSpan[]>(
        (res, span) => {
            const spans = applyColorizationOnSpan(span, colorization);
            res.push(...spans);
            return res;
        },
        []);
}

function applyColorizationOnSpan(span: ColorizedSpan, { range, color }: Colorization): ColorizedSpan[] {
    const [prefix, offset] = breakPath(span.path);
    const [startPrefix, startOffset] = breakPath(range.start);
    const [endPrefix, endOffset] = range.end
        ? breakPath(range.end)
        : [undefined, undefined];

    const len = span.text.length;
    const start = samePath(startPrefix, prefix) ? startOffset - offset
        : pathLessThan(startPrefix, prefix) ? 0
            : len;
    const end = endPrefix !== undefined && endOffset !== undefined
        ? (
            samePath(prefix, endPrefix) ? endOffset - offset
                : pathLessThan(prefix, endPrefix) ? len : 0
        )
        : 0;
    const pointA = 0;
    const pointB = Math.min(Math.max(start, 0), len);
    const pointC = Math.min(Math.max(end, 0), len);
    const pointD = len;
    const result: ColorizedSpan[] = [];
    if (pointA < pointB) {
        result.push({
            text: span.text.substring(pointA, pointB),
            path: span.path,
            color: span.color,
        });
    }
    if (pointB < pointC) {
        result.push({
            text: span.text.substring(pointB, pointC),
            path: [...prefix, pointB + offset],
            color,
        })
    }
    if (pointC < pointD) {
        result.push({
            text: span.text.substring(pointC, pointD),
            path: [...prefix, pointC + offset],
            color: span.color,
        })
    }
    return result;
}

function breakPath(path: BooqPath) {
    const head = path.slice(0, path.length - 1);
    const tail = path[path.length - 1];
    return [head, tail] as const;
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