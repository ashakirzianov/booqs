import { BooqElement, BooqChildNode, textNode, BooqDocument } from '../core'
import { parseDocument as parseHtmlDocument } from 'htmlparser2'
import { ChildNode, isTag, isText } from 'domhandler'

export type EpubDocument = {
    fileName: string,
    id: string,
    content: string,
}

export function parseDocument({ document }: {
    document: EpubDocument,
}): BooqDocument {
    const parsed = parseHtmlDocument(document.content, {
        xmlMode: true,
        recognizeSelfClosing: true,
    })
    return {
        fileName: document.fileName,
        children: convertNodes(parsed.childNodes as ChildNode[]),
    }
}

function convertNodes(nodes: ChildNode[]): BooqChildNode[] {
    return nodes.map(convertNode)
}

function convertNode(node: ChildNode): BooqChildNode {
    if (isText(node)) {
        return textNode(node.data)
    }
    if (!isTag(node)) {
        return null
    }
    if (node.name === 'script') {
        return {
            name: node.name,
            attributes: attrsOrUndefined(node.attribs),
            children: [],
        }
    }
    const result: BooqElement = {
        name: node.name,
        attributes: attrsOrUndefined(node.attribs),
        children: node.children.length > 0
            ? convertNodes(node.children as ChildNode[])
            : [],
    }
    return result
}

function attrsOrUndefined(attribs: Record<string, string>): Record<string, string> | undefined {
    return Object.keys(attribs).length > 0 ? attribs : undefined
}
