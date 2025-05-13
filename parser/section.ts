import { BooqNode, BooqElementNode } from '../core'
import {
    xmlStringParser, XmlElement, xml2string, childrenOf, nameOf, attributesOf, textOf, asObject, XmlAttributes,
    findByName,
} from './xmlTree'
import { Epub } from './epub'
import { transformHref } from './parserUtils'
import { resolveRelativePath } from './path'
import { isComment } from 'domutils'
import { Diagnoser } from 'booqs-epub'
import { prefixAllSeclectors } from './css'

export type EpubSection = {
    fileName: string,
    id: string,
    content: string,
}
export async function parseSection(section: EpubSection, file: Epub, diags: Diagnoser): Promise<BooqNode> {
    const node = await processSectionContent(section.content, {
        id: section.id,
        fileName: section.fileName,
        css: '',
        diags,
        resolveTextFile: async href => {
            const resolved = resolveRelativePath(href, section.fileName)
            return file.loadTextFile(resolved)
        },
    })
    return node
}

type Env = {
    id: string,
    fileName: string,
    css: string,
    diags: Diagnoser,
    resolveTextFile: (href: string) => Promise<string | undefined>,
}

async function processSectionContent(content: string, env: Env): Promise<BooqNode> {
    const document = xmlStringParser(content)
    const html = findByName(document.childNodes, 'html')
    if (!html) {
        env.diags.push({
            message: 'missing html element',
            data: { xml: xml2string(document) },
        })
        return {
            kind: 'element',
            name: 'section',
            id: env.fileName,
            fileName: env.fileName,
        }
    }
    const elements = childrenOf(html)
    const children: BooqNode[] = []
    for (const element of elements) {
        let child: BooqNode = stub()
        const name = nameOf(element)
        switch (name) {
            case 'html':
                break
            case 'head':
                child = await processHead(element, env)
                break
            case 'body':
                child = await processXml(element, env)
                if (child.kind === 'element') {
                    child.name = 'div'
                }
                else {
                    env.diags.push({
                        message: 'unexpected body node',
                        data: { xml: xml2string(element) },
                    })
                }
                break
            default:
                if (!isEmptyText(element) && isComment(element)) {
                    env.diags.push({
                        message: `unexpected node: ${name}`,
                        data: { xml: xml2string(element) },
                    })
                }
                break
        }
        children.push(child)
    }
    const css = env.css.length > 0
        ? prefixAllSeclectors(env.css, generateSelectorPrefix(env.id))
        : undefined
    return {
        kind: 'element',
        name: 'section',
        css,
        attrs: {
            className: generateSelectorPrefix(env.id),
        },
        id: env.fileName,
        fileName: env.fileName,
        children,
    }
}

async function processHead(head: XmlElement, env: Env): Promise<BooqNode> {
    const children: BooqNode[] = []
    for (const childElement of childrenOf(head)) {
        let child: BooqNode = stub()
        switch (nameOf(childElement)) {
            case 'link': {
                child = await processLink(childElement, env)
                break
            }
            case 'style': {
                child = await processXml(childElement, env)
                break
            }
            case 'title':
            case 'meta':
            case 'script':
                // TODO: handle ?
                break
            default:
                if (!(isEmptyText(childElement) || isComment(childElement))) {
                    env.diags.push({
                        message: 'unexpected head node',
                        data: { xml: xml2string(childElement) },
                    })
                }
        }
        children.push(child)
    }
    return {
        kind: 'element',
        name: 'div',
        children,
    }
}

async function processLink(link: XmlElement, env: Env): Promise<BooqNode> {
    const { rel, href, type } = attributesOf(link)
    switch (rel?.toLowerCase()) {
        case 'stylesheet':
            break
        case 'coverpage':
        case 'icon':
            return stub()
        default:
            env.diags.push({
                message: `unexpected link rel: ${rel}`,
                data: { xml: xml2string(link) },
            })
            return stub()
    }
    switch (type?.toLowerCase()) {
        case 'text/css':
            break
        // Note: known unsupported
        case 'application/vnd.adobe-page-template+xml':
            return stub()
        // Note: unknown unsupported
        default:
            if (rel !== 'stylesheet') {
                env.diags.push({
                    message: `unexpected link type: ${type}`,
                    data: { xml: xml2string(link) },
                })
                return stub()
            }
            break
    }
    if (href === undefined) {
        env.diags.push({
            message: 'missing href on link',
            data: { xml: xml2string(link) },
        })
        return stub()
    }
    const content = await env.resolveTextFile(href)
    if (content === undefined) {
        env.diags.push({
            message: `couldn't load css: ${href}`,
            data: { xml: xml2string(link) },
        })
        return stub()
    } else {
        env.css += content
        env.css += '\n'
        return stub()
    }
}

async function processXmls(xmls: XmlElement[], env: Env) {
    return Promise.all(xmls.map(n => processXml(n, env)))
}

async function processXml(element: XmlElement, env: Env): Promise<BooqNode> {
    const text = textOf(element)
    if (text !== undefined) {
        return { kind: 'text', content: text }
    }

    const name = nameOf(element)
    switch (name) {
        case 'head':
        case 'link':
            env.diags.push({
                message: `unexpected node in body content: ${name}`,
                data: { xml: xml2string(element) },
            })
            return stub()
        case 'script': // Remove all script tags
            env.diags.push({
                message: `script node in epub`,
                severity: 'info',
                data: { xml: xml2string(element) },
            })
            return stub()
        case 'style':
            return processStyleXml(element, env)
        case undefined:
            return stub()
        default:
            return processRegularXml(element, env)
    }

}

async function processRegularXml(element: XmlElement, env: Env): Promise<BooqNode> {
    const {
        name, children, attributes,
    } = asObject(element)
    if (name === undefined) {
        env.diags.push({
            message: 'missing name in element',
            data: { xml: xml2string(element) },
        })
        return stub()
    }
    const { id, style: _, ...rest } = attributes ?? {}
    const result: BooqElementNode = {
        kind: 'element',
        name,
        id: processId(id, env),
        attrs: processAttributes(rest, env),
        children: children?.length
            ? await processXmls(children, env)
            : undefined,
    }
    return result
}

async function processStyleXml(element: XmlElement, env: Env): Promise<BooqNode> {
    const {
        children,
        attributes,
    } = asObject(element)
    if (attributes?.type && attributes?.type !== 'text/css') {
        env.diags.push({
            message: `unexpected style type: ${attributes?.type}`,
            data: { xml: xml2string(element) },
        })
        return stub()
    }
    const [textElement, ...rest] = children ?? []
    if (rest.length > 0) {
        env.diags.push({
            message: 'unexpected children in style',
            severity: 'warning',
            data: { xml: xml2string(element) },
        })
    }
    const text = textElement && textOf(textElement)
    if (text === undefined) {
        env.diags.push({
            message: 'missing text in style',
            data: {
                xml: xml2string(element),
                firstChild: xml2string(textElement),
            },
        })
        return stub()
    }
    if (attributes?.media) {
        env.diags.push({
            message: `unsupported media attribute: ${attributes?.media}`,
            data: { xml: xml2string(element) },
        })
    }
    env.css += text
    env.css += '\n'
    return stub()
}

function generateSelectorPrefix(id: string) {
    return `booqs-${id.replace(/[^a-zA-Z0-9]/g, '-')}`
}

function stub(): BooqNode {
    return {
        kind: 'stub',
        length: 0,
    }
}

function processId(id: string | undefined, env: Env) {
    return id
        ? `${env.fileName}/${id}`
        : undefined
}

function processAttributes(attrs: XmlAttributes, _env: Env) {
    const entries = Object
        .entries(attrs)
        .map(([key, value]): [string, string | undefined] => {
            switch (key) {
                case 'xml:space':
                    return ['xmlSpace', value]
                case 'xml:lang':
                    return ['xmlLang', value]
                case 'colspan':
                    return ['colSpan', value]
                case 'rowspan':
                    return ['rowSpan', value]
                case 'href':
                    return ['href', value ? transformHref(value) : undefined]
                case 'cellspacing':
                    return ['cellSpacing', value]
                case 'cellpadding':
                    return ['cellPadding', value]
                case 'class':
                    return ['className', value]
                default:
                    return [key, value]
            }
        })
    return entries.length
        ? Object.fromEntries(entries)
        : undefined
}

function isEmptyText(xml: XmlElement) {
    const text = textOf(xml)
    return text !== undefined && text.match(/^\s*$/)
        ? true : false
}
