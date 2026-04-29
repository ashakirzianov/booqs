import { ReactNode, createElement } from 'react'
import {
    BooqElement, BooqDocument, BooqNode, BooqStyles, pathToString, pathFromString,
    pathInRange, samePath, pathLessThan, BooqPath, BooqRange, pathToId,
    assertNever, isTextNode, isStubNode, isElementNode, isDocumentNode,
    DATA_PATH, DATA_REF_PATH, DATA_AUGMENTATION_ID, isMarkedAsParagraph,
} from '@/core'

export type Augmentation = {
    range: BooqRange,
    id: string,
    color?: string,
    underline?: 'solid' | 'dashed',
}

export const PARAGRAPH_CLASS = 'booqs-pph'

type RenderContext = {
    path: BooqPath,
    range: BooqRange,
    styles: BooqStyles,
    parent?: BooqElement,
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
    if (isTextNode(node)) {
        switch (ctx.parent?.name) {
            case 'table': case 'tbody': case 'tr':
                return null
            case 'style':
                return node
            default:
                return renderTextNode(node, ctx)
        }
    } else if (isStubNode(node)) {
        return null
    } else if (isDocumentNode(node)) {
        return renderDocumentNode(node, ctx)
    } else if (isElementNode(node)) {
        const mappedName = mapElementName(node.name, ctx)
        if (mappedName === null) {
            return null
        }
        return createElement(
            mappedName,
            getProps(node, ctx),
            getChildren(node, ctx),
        )
    } else {
        assertNever(node)
        return null
    }
}

function renderDocumentNode(node: BooqDocument, ctx: RenderContext): ReactNode {
    const children = node.children ? renderNodes(node.children, {
        ...ctx,
        parent: undefined,
    }) : null
    const styleNodes = (node.styleRefs ?? [])
        .map((ref: string) => ctx.styles[ref])
        .filter(Boolean)
        .map((css: string, i: number) => createElement(
            'style',
            { key: `${pathToString(ctx.path)}-style-${i}` },
            css,
        ))
    const className = node.styleRefs?.join(' ')
    return createElement(
        'section',
        {
            key: pathToString(ctx.path),
            [DATA_PATH]: pathToString(ctx.path),
            className,
        },
        [...styleNodes, ...(children ?? [])],
    )
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
            [DATA_PATH]: pathToString(path),
        },
        spans.map(span => {
            const augmentationId = span.id
            const augmentationProps = augmentationId ? {
                [DATA_AUGMENTATION_ID]: augmentationId,
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
                    [DATA_PATH]: pathToString(span.path),
                    ...augmentationProps,
                },
                span.text,
            )
        }),
    )
}

function getProps(node: BooqElement, {
    path, range, hrefForPath,
}: RenderContext) {
    const normalized = normalizeAttributes(node.attributes)
    const className = isMarkedAsParagraph(node)
        ? (normalized?.className ? `${PARAGRAPH_CLASS} ${normalized.className}` : PARAGRAPH_CLASS)
        : normalized?.className
    const refPath = parseRefPath(node.attributes?.[DATA_REF_PATH])
    return {
        ...normalized,
        [DATA_PATH]: pathToString(path),
        [DATA_REF_PATH]: undefined,
        className,
        key: pathToString(path),
        style: node.attributes?.style ? parseInlineStyle(node.attributes.style) : undefined,
        href: refPath
            ? (
                pathInRange(refPath, range)
                    ? normalized?.href
                    : hrefForPath ?
                        hrefForPath(refPath)
                        : node.attributes?.href
            )
            : node.attributes?.href,
    }
}

// Converts XML attribute names to React prop names at render time.
function mapElementName(name: string, ctx: RenderContext): string | null {
    switch (name) {
        case 'head': case 'link': case 'script': case 'meta': case 'title': return null
        case 'html': case 'body': return 'div'
        case 'a': return ctx.withinAnchor ? 'span' : 'a'
        default: return name
    }
}

const attributeNameMap: Record<string, string> = {
    'class': 'className',
    'colspan': 'colSpan',
    'rowspan': 'rowSpan',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'xml:space': 'xmlSpace',
    'xml:lang': 'xmlLang',
    'xmlns:xlink': 'xmlnsXlink',
    'xlink:href': 'xlinkHref',
}

function normalizeAttributes(attributes: BooqElement['attributes']): Record<string, string | undefined> | undefined {
    if (!attributes) return undefined
    const entries = Object.entries(attributes).map(([key, value]) => {
        const reactKey = attributeNameMap[key] ?? key
        return [reactKey, value]
    })
    return Object.fromEntries(entries)
}

function getChildren(node: BooqElement, ctx: RenderContext) {
    const children = node.children && renderNodes(node.children, {
        ...ctx,
        parent: node,
        withinAnchor: ctx.withinAnchor || node.name === 'a',
    })
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

function parseRefPath(value: string | undefined): BooqPath | undefined {
    if (!value) return undefined
    return pathFromString(value)
}

function parseInlineStyle(style: string): Record<string, string> {
    const result: Record<string, string> = {}
    for (const rule of style.split(';')) {
        const trimmed = rule.trim()
        if (trimmed.length === 0) continue
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex === -1) continue
        const property = trimmed.slice(0, colonIndex).trim()
            .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
        const value = trimmed.slice(colonIndex + 1).trim()
        result[property] = value
    }
    return result
}
