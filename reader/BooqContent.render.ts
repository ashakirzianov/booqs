import { ReactNode, createElement } from "react";
import {
    BooqPath, BooqRange, BooqElementNode, BooqNode, pathToString,
    pathInRange, samePath, pathLessThan,
} from "core";
import { pathToId } from "app";
import { booqHref } from "controls/Links";
import type { Colorization } from "./BooqContent";

type RenderContext = {
    booqId: string,
    path: BooqPath,
    range: BooqRange,
    parent?: BooqElementNode,
    withinAnchor?: boolean,
    colorization: Colorization[],
};
export function renderNodes(nodes: BooqNode[], ctx: RenderContext): ReactNode {
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
    return spans.map(
        span => createElement(
            'span',
            {
                key: id,
                id,
                style: {
                    background: span.color,
                },
            },
            span.text,
        )
    );
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
        src: node.attrs?.src
            ? (
                isExternalSrc(node.attrs.src)
                    ? node.attrs.src
                    : imageFullSrc(booqId, node.attrs.src)
            )
            : undefined,
    };
}

function isExternalSrc(src: string) {
    return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('www.');
}

function imageFullSrc(booqId: string, src: string) {
    return `https://booqs-images.s3.amazonaws.com/${booqId}/${src}`;
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