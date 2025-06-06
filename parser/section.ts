import { BooqNode, BooqNodeStyle, BooqElementNode } from '../core'
import {
    xmlStringParser, XmlElement, findByName, xml2string, childrenOf, nameOf, attributesOf, textOf, asObject, XmlAttributes,
} from './xmlTree'
import { EpubSection, EpubPackage } from './epub'
import { parseCss, Stylesheet, StyleRule, applyRules } from './css'
import { transformHref } from './parserUtils'
import capitalize from 'lodash-es/capitalize'
import { resolveRelativePath } from './path'
import { isComment } from 'domutils'
import { Diagnoser } from 'booqs-epub'

export async function parseSection(section: EpubSection, file: EpubPackage, diags: Diagnoser): Promise<BooqNode | undefined> {
    const node = await processSectionContent(section.content, {
        fileName: section.fileName,
        stylesheet: { rules: [] },
        diags,
        resolveTextFile: async href => {
            const resolved = resolveRelativePath(href, section.fileName)
            return file.textResolver(resolved)
        },
    })
    return node
}

type Env = {
    fileName: string,
    stylesheet: Stylesheet,
    diags: Diagnoser,
    resolveTextFile: (href: string) => Promise<string | undefined>,
}

async function processSectionContent(content: string, env: Env): Promise<BooqNode | undefined> {
    const elements = xmlStringParser(content)
    const head = findByName(elements, 'head')
    const body = findByName(elements, 'body')
    if (!body) {
        env.diags.push({
            message: 'missing body node',
            data: { xml: xml2string(...elements) },
        })
        return undefined
    } else {
        const stylesheet = head && (head as any).name !== undefined
            ? await processHead(head, env)
            : undefined
        return processBody(body, {
            ...env,
            stylesheet: stylesheet ?? env.stylesheet,
        })
    }
}

async function processHead(head: XmlElement, env: Env) {
    const rules: StyleRule[] = []
    for (const ch of childrenOf(head)) {
        switch (nameOf(ch)) {
            case 'link': {
                const fromLink = await processLink(ch, env)
                rules.push(...fromLink)
                break
            }
            case 'style': {
                const fromStyle = await processStyleElement(ch, env)
                rules.push(...fromStyle)
                break
            }
            case 'title':
            case 'meta':
            case 'script':
                // TODO: handle ?
                break
            default:
                if (!(isEmptyText(ch) || isComment(ch))) {
                    env.diags.push({
                        message: 'unexpected head node',
                        data: { xml: xml2string(ch) },
                    })
                }
        }
    }
    return { rules }
}

async function processLink(link: XmlElement, env: Env) {
    const { rel, href, type } = attributesOf(link)
    switch (rel?.toLowerCase()) {
        case 'stylesheet':
            break
        case 'coverpage':
        case 'icon':
            return []
        default:
            env.diags.push({
                message: `unexpected link rel: ${rel}`,
                data: { xml: xml2string(link) },
            })
            return []
    }
    switch (type?.toLowerCase()) {
        case 'text/css':
            break
        // Note: known unsupported
        case 'application/vnd.adobe-page-template+xml':
            return []
        // Note: unknown unsupported
        default:
            if (rel !== 'stylesheet') {
                env.diags.push({
                    message: `unexpected link type: ${type}`,
                    data: { xml: xml2string(link) },
                })
                return []
            }
            break
    }
    if (href === undefined) {
        env.diags.push({
            message: 'missing href on link',
            data: { xml: xml2string(link) },
        })
        return []
    }
    const content = await env.resolveTextFile(href)
    if (content === undefined) {
        env.diags.push({
            message: `couldn't load css: ${href}`,
            data: { xml: xml2string(link) },
        })
        return []
    } else {
        const value = parseCss(content, href, env.diags)
        return value?.rules ?? []
    }
}

async function processStyleElement(style: XmlElement, env: Env) {
    const [content] = childrenOf(style)
    const { type } = attributesOf(style)
    const text = content && textOf(content)
    if (type !== 'text/css' || text === undefined) {
        env.diags.push({
            message: 'unsupported style tag',
            data: { xml: xml2string(style) },
        })
        return []
    }
    const value = parseCss(text, `${env.fileName}: <style>`, env.diags)
    return value?.rules ?? []
}

function processBody(body: XmlElement, env: Env) {
    const node = processXml(body, env)
    return node.kind === 'element'
        ? {
            ...node,
            id: env.fileName,
            fileName: env.fileName,
            name: 'div',
            style: undefined, // Note: ignore body-level styles
        }
        : node
}

function processXmls(xmls: XmlElement[], env: Env) {
    return xmls.map(n => processXml(n, env))
}

function processXml(element: XmlElement, env: Env): BooqNode {
    const {
        text,
        name, children,
        attributes,
    } = asObject(element)
    if (text !== undefined) {
        return { kind: 'text', content: text }
    } else if (name) {
        const { id, class: _, style: __, ...rest } = attributes ?? {}
        const result: BooqElementNode = {
            kind: 'element',
            name,
            id: processId(id, env),
            style: processStyle(element, env),
            attrs: processAttributes(rest, env),
            children: children?.length
                ? processXmls(children, env)
                : undefined,
        }
        return result
    } else {
        return {
            kind: 'stub',
            length: 0,
        }
    }
}

function processId(id: string | undefined, env: Env) {
    return id
        ? `${env.fileName}/${id}`
        : undefined
}

function processStyle(element: XmlElement, env: Env) {
    const input = applyRules(element, env.stylesheet.rules, env.diags)
    const style: BooqNodeStyle = {}
    for (const [property, value] of Object.entries(input)) {
        switch (property) {
            case 'background': case 'background-color':
                if (isWhiteColor(value)) {
                    continue
                }
                break
            case 'color':
                if (isBlackColor(value)) {
                    continue
                }
        }
        style[translatePropertyName(property)] = value
    }
    return Object.keys(style).length > 0
        ? style
        : undefined
}

function isWhiteColor(color: string | undefined) {
    switch (color) {
        case 'white': case '#fff': case '#ffffff':
            return true
        default:
            return false
    }
}

function isBlackColor(color: string | undefined) {
    switch (color) {
        case 'black': case '#000': case '#000000':
            return true
        default:
            return false
    }
}

function translatePropertyName(property: string): string {
    const comps = property.split('-')
    const result = comps.reduce((res, c) => res + capitalize(c))
    return result
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
