import { ReactNode, createElement } from "react";
import {
    BooqPath, BooqRange, BooqElementNode, BooqNode, pathToString,
    pathInRange, samePath, pathLessThan,
} from "core";
import { pathToId } from "app";
import { booqHref } from "controls/Links";
import type { Augmentation } from "./BooqContent";

type RenderContext = {
    booqId: string,
    path: BooqPath,
    range: BooqRange,
    parent?: BooqElementNode,
    withinAnchor?: boolean,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
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

function renderTextNode(text: string, {
    path, augmentations, onAugmentationClick,
}: RenderContext): ReactNode {
    const spans = applyAugmentations({
        text, path: [...path, 0],
        id: undefined,
    },
        augmentations,
    );
    return createElement(
        'span',
        {
            key: pathToId(path),
            id: pathToId(path),
        },
        spans.map(span => {
            const augmentedId = span.id;
            const augmentationProps = augmentedId ? {
                style: {
                    background: span.color,
                    cursor: 'pointer',
                },
                onClick: onAugmentationClick
                    ? () => onAugmentationClick(augmentedId)
                    : undefined,
            } : {};
            return createElement(
                'span',
                {
                    key: pathToId(span.path),
                    id: pathToId(span.path),
                    ...augmentationProps,
                },
                span.text,
            );
        }),
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

// --- Augmentation

type AugmentedSpan = {
    path: BooqPath,
    text: string,
    color?: string,
    id: string | undefined,
};

function applyAugmentations(span: AugmentedSpan, augmentations: Augmentation[]) {
    return augmentations.reduce(
        (res, col) => {
            const spans = applyAugmentationOnSpans(res, col);
            return spans;
        },
        [span],
    );
}

function applyAugmentationOnSpans(spans: AugmentedSpan[], augmentation: Augmentation) {
    return spans.reduce<AugmentedSpan[]>(
        (res, span) => {
            const spans = applyAugmentationOnSpan(span, augmentation);
            res.push(...spans);
            return res;
        },
        []);
}

function applyAugmentationOnSpan(span: AugmentedSpan, { range, color, id }: Augmentation): AugmentedSpan[] {
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
    const result: AugmentedSpan[] = [];
    if (pointA < pointB) {
        result.push({
            text: span.text.substring(pointA, pointB),
            path: span.path,
            color: span.color,
            id: span.id,
        });
    }
    if (pointB < pointC) {
        result.push({
            text: span.text.substring(pointB, pointC),
            path: [...prefix, pointB + offset],
            color, id,
        })
    }
    if (pointC < pointD) {
        result.push({
            text: span.text.substring(pointC, pointD),
            path: [...prefix, pointC + offset],
            color: span.color,
            id: span.id,
        })
    }
    return result;
}

function breakPath(path: BooqPath) {
    const head = path.slice(0, path.length - 1);
    const tail = path[path.length - 1];
    return [head, tail] as const;
}