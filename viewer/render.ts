import { ReactNode, createElement } from 'react'
import {
    BooqElementNode, BooqNode, pathToString,
    pathInRange, samePath, pathLessThan, BooqPath, BooqRange, pathToId,
    assertNever,
} from '@/core'

export type Augmentation = {
    range: BooqRange,
    id: string,
    color?: string,
    underline?: 'solid' | 'dashed',
}

type RenderContext = {
    path: BooqPath,
    range: BooqRange,
    parent?: BooqElementNode,
    withinAnchor?: boolean,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    hrefForPath?: (path: BooqPath) => string,
}
export function renderNodes(nodes: BooqNode[], ctx: RenderContext): ReactNode[] {
    const result = nodes.map(
        (n, idx) => renderNode(n, {
            ...ctx,
            path: [...ctx.path, idx],
        }),
    )
    return result
}
function renderNode(node: BooqNode, ctx: RenderContext): ReactNode {
    switch (node?.kind) {
        case 'text':
            switch (ctx.parent?.name) {
                case 'table': case 'tbody': case 'tr':
                    return null
                case 'style':
                    return node.content
                default:
                    return renderTextNode(node.content, ctx)
            }
        case 'stub':
        case undefined:
            return null
        case 'element':
            return createElement(
                node.name === 'a' && ctx.withinAnchor
                    ? 'span' // Do not nest anchors
                    : node.name,
                getProps(node, ctx),
                getChildren(node, ctx),
            )
        default:
            assertNever(node)
            return null
    }
}

function renderTextNode(text: string, {
    path, augmentations, onAugmentationClick,
}: RenderContext): ReactNode {
    const isWhitespace = text.trim().length === 0
    if (isWhitespace) {
        return null
    }
    const spans = applyAugmentations({
        text, path: [...path, 0],
        id: undefined,
        underline: undefined,
    },
        augmentations,
    )
    return createElement(
        'span',
        {
            key: pathToId(path),
            id: pathToId(path),
        },
        spans.map(span => {
            const augmentationId = span.id
            const augmentationProps = augmentationId ? {
                'data-augmentation-id': augmentationId,
                style: {
                    background: span.color,
                    cursor: 'pointer',
                    ...(span.underline && {
                        textDecoration: 'underline',
                        textDecorationStyle: span.underline,
                    }),
                },
                onClick: onAugmentationClick
                    ? () => onAugmentationClick(augmentationId)
                    : undefined,
            } : {}
            return createElement(
                'span',
                {
                    key: pathToId(span.path),
                    id: pathToId(span.path),
                    ...augmentationProps,
                },
                span.text,
            )
        }),
    )
}

function getProps(node: BooqElementNode, {
    path, range, hrefForPath,
}: RenderContext) {
    return {
        ...node.attrs,
        id: pathToId(path),
        className: node.pph
            ? (node.attrs?.className ? `booq-pph ${node.attrs.className}` : 'booq-pph')
            : node.attrs?.className,
        key: pathToString(path),
        style: node.style,
        href: node.ref
            ? (
                pathInRange(node.ref, range)
                    ? `#${pathToId(node.ref)}`
                    : hrefForPath ?
                        hrefForPath(node.ref)
                        : node.attrs?.href
            )
            : node.attrs?.href,
    }
}

function getChildren(node: BooqElementNode, ctx: RenderContext) {
    const children = node.children && renderNodes(node.children, {
        ...ctx,
        parent: node,
        withinAnchor: ctx.withinAnchor || node.name === 'a',
    })
    if (node.css) {
        const styleNode = createElement(
            'style',
            {
                key: `${pathToString(ctx.path)}-style`,
            },
            node.css,
        )
        return children
            ? [styleNode, ...children]
            : styleNode
    }
    return (children?.length ?? 0) > 0
        ? children
        : null
}

// --- Augmentation

type AugmentedSpan = {
    path: BooqPath,
    text: string,
    color?: string,
    underline?: 'solid' | 'dashed',
    id: string | undefined,
}

function applyAugmentations(span: AugmentedSpan, augmentations: Augmentation[]) {
    return augmentations.reduce(
        (res, col) => {
            const spans = applyAugmentationOnSpans(res, col)
            return spans
        },
        [span],
    )
}

function applyAugmentationOnSpans(spans: AugmentedSpan[], augmentation: Augmentation) {
    return spans.reduce<AugmentedSpan[]>(
        (res, span) => {
            const spans = applyAugmentationOnSpan(span, augmentation)
            res.push(...spans)
            return res
        },
        [])
}

function applyAugmentationOnSpan(span: AugmentedSpan, { range, color, underline, id }: Augmentation): AugmentedSpan[] {
    const [prefix, offset] = breakPath(span.path)
    const [startPrefix, startOffset] = breakPath(range.start)
    const [endPrefix, endOffset] = range.end
        ? breakPath(range.end)
        : [undefined, undefined]

    const len = span.text.length
    const start = samePath(startPrefix, prefix) ? startOffset - offset
        : pathLessThan(startPrefix, prefix) ? 0
            : len
    const end = endPrefix !== undefined && endOffset !== undefined
        ? (
            samePath(prefix, endPrefix) ? endOffset - offset
                : pathLessThan(prefix, endPrefix) ? len : 0
        )
        : 0
    const pointA = 0
    const pointB = Math.min(Math.max(start, 0), len)
    const pointC = Math.min(Math.max(end, 0), len)
    const pointD = len
    const result: AugmentedSpan[] = []
    if (pointA < pointB) {
        result.push({
            text: span.text.substring(pointA, pointB),
            path: span.path,
            color: span.color,
            underline: span.underline,
            id: span.id,
        })
    }
    if (pointB < pointC) {
        result.push({
            text: span.text.substring(pointB, pointC),
            path: [...prefix, pointB + offset],
            color, underline, id,
        })
    }
    if (pointC < pointD) {
        result.push({
            text: span.text.substring(pointC, pointD),
            path: [...prefix, pointC + offset],
            color: span.color,
            underline: span.underline,
            id: span.id,
        })
    }
    return result
}

function breakPath(path: BooqPath) {
    const head = path.slice(0, path.length - 1)
    const tail = path[path.length - 1]
    return [head, tail] as const
}