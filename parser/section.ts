import { BooqElement, BooqChildNode, textNode, BooqDocument } from '../core'
import {
    xmlStringParser, XmlElement, xml2string, nameOf, textOf, asObject,
} from './xmlTree'
import { transformHref } from './parserUtils'
import { Diagnoser } from 'booqs-epub'

export type EpubSection = {
    fileName: string,
    id: string,
    content: string,
}
export async function parseDocument({ section, diags }: {
    section: EpubSection,
    diags: Diagnoser,
}): Promise<BooqDocument> {
    const env: Env = {
        fileName: section.fileName,
        diags,
    }
    const document = xmlStringParser(section.content)
    const children = await processXmls(document.childNodes, env)
    return {
        fileName: env.fileName,
        children,
    }
}

type Env = {
    fileName: string,
    diags: Diagnoser,
}



async function processXmls(xmls: XmlElement[], env: Env) {
    return Promise.all(xmls.map(n => processXml(n, env)))
}

async function processXml(element: XmlElement, env: Env): Promise<BooqChildNode> {
    const text = textOf(element)
    if (text !== undefined) {
        return textNode(text)
    }

    const name = nameOf(element)
    switch (name) {
        case 'script': {
            const { name: scriptName, attributes: scriptAttrs } = asObject(element)
            return {
                name: scriptName ?? 'script',
                attributes: scriptAttrs,
                children: [],
            }
        }
        case undefined:
            return stub()
        default:
            return processRegularXml(element, env)
    }

}

async function processRegularXml(element: XmlElement, env: Env): Promise<BooqChildNode> {
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
    const { id, href, ...rest } = attributes ?? {}
    const processedAttrs = {
        ...rest,
        ...(href !== undefined ? { href: transformHref(href) } : {}),
    }
    const result: BooqElement = {
        name,
        id: processId(id, env),
        attributes: Object.keys(processedAttrs).length > 0 ? processedAttrs : undefined,
        children: children?.length
            ? await processXmls(children, env)
            : [],
    }
    return result
}


function stub(): BooqChildNode {
    return null
}

function processId(id: string | undefined, env: Env) {
    return id
        ? `${env.fileName}/${id}`
        : undefined
}


